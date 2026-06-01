const { app, BrowserWindow, ipcMain, dialog, shell, net, Notification, powerSaveBlocker } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const http = require('http');

// Letra de la unidad del sistema (donde corre Windows), normalmente "C:"
const SYSTEM_DRIVE = (process.env.SystemDrive || 'C:').toUpperCase();
let powerBlockerId = null;

// Ensure app works when launched via Windows ShellExecute (double-click)
if (process.argv.indexOf('--no-sandbox') === -1) {
  app.commandLine.appendSwitch('no-sandbox');
}
app.commandLine.appendSwitch('disable-dev-shm-usage');

let mainWindow;
let flashProcess = null;
let activeDownload = null;

function getEnginePath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'rufus-engine.exe')
    : path.join(__dirname, '..', '..', 'build', 'rufus-engine.exe');
}

// Cuando corre como portable, Electron extrae a una carpeta Temp.
// Copiamos el engine a userData y lo desbloqueamos para que Windows permita ejecutarlo.
function getReadyEnginePath() {
  const src = getEnginePath();
  if (!app.isPackaged) return src;

  const dest = path.join(app.getPath('userData'), 'rufus-engine.exe');
  try {
    const srcStat = fs.statSync(src);
    const destStat = fs.existsSync(dest) ? fs.statSync(dest) : null;
    if (!destStat || srcStat.mtimeMs > destStat.mtimeMs) {
      fs.copyFileSync(src, dest);
      // Eliminar Mark-of-the-Web para que Windows no bloquee la ejecución
      try {
        execSync(`powershell -NoProfile -Command "Unblock-File -Path '${dest}'"`, { timeout: 5000 });
      } catch {}
    }
  } catch (e) {
    return src;
  }
  return dest;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 800,
    minWidth: 640,
    minHeight: 800,
    frame: false,
    resizable: false,
    backgroundColor: '#070810',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'renderer', 'assets', 'logo.png'),
    show: false,
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (activeDownload) activeDownload.abort();
  app.quit();
});

// ── Window controls ───────────────────────────────────────────────────────────
ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-close', () => {
  if (flashProcess) flashProcess.kill();
  if (activeDownload) activeDownload.abort();
  app.quit();
});

// ── Drive detection — todas las unidades excepto CD-ROM ──────────────────────
//  Devuelve flags: removable (USB), isSystem (disco de Windows actual).
//  El renderer decide qué mostrar (solo USB por defecto, internos en avanzado).
ipcMain.handle('list-usb-drives', async () => {
  try {
    const raw = execSync(
      'powershell -NoProfile -Command "Get-WmiObject Win32_LogicalDisk | Select-Object DeviceID,VolumeName,Size,FreeSpace,DriveType | ConvertTo-Json -Compress"',
      { timeout: 10000 }
    ).toString().trim();

    if (!raw || raw === 'null') return [];
    const data = JSON.parse(raw);
    const disks = Array.isArray(data) ? data : [data];

    return disks
      .filter(d => {
        if (!d || !d.DeviceID) return false;
        if (d.DriveType === 5) return false;        // CD-ROM
        if (!d.Size || parseInt(d.Size) === 0) return false;
        return true;
      })
      .map(d => {
        const sizeGB = Math.round(parseInt(d.Size) / 1073741824);
        const freeGB = d.FreeSpace ? Math.round(parseInt(d.FreeSpace) / 1073741824) : null;
        const label = d.VolumeName || '';
        const isRemovable = d.DriveType === 2;
        const isSystem = (d.DeviceID || '').toUpperCase() === SYSTEM_DRIVE;
        const icon = isRemovable ? '💾' : '🖥️';
        const typeTag = isRemovable ? 'USB' : 'Disco';
        const displayName = label
          ? `${icon} ${label} (${d.DeviceID}) — ${typeTag}`
          : `${icon} ${d.DeviceID} — ${typeTag} ${sizeGB} GB`;
        return {
          model: label || d.DeviceID,
          sizeGB,
          freeGB,
          letters: [d.DeviceID],
          label: displayName,
          tooSmall: sizeGB < 8,
          driveType: d.DriveType,
          removable: isRemovable,
          isSystem,
        };
      });
  } catch (e) {
    return [];
  }
});

// ── Detección del PC actual (marca, modelo, firmware, RAM) ───────────────────
let pcInfoCache = null;
ipcMain.handle('get-pc-info', async () => {
  if (pcInfoCache) return pcInfoCache;
  try {
    const ps =
      "$cs = Get-WmiObject Win32_ComputerSystem;" +
      "$fw = 'desconocido';" +
      "try { Confirm-SecureBootUEFI -ErrorAction Stop | Out-Null; $fw='UEFI' } catch { $fw='BIOS' };" +
      "[pscustomobject]@{ Manufacturer=$cs.Manufacturer; Model=$cs.Model; RAM=$cs.TotalPhysicalMemory; Firmware=$fw } | ConvertTo-Json -Compress";
    const raw = execSync(`powershell -NoProfile -Command "${ps}"`, { timeout: 10000 }).toString().trim();
    const d = JSON.parse(raw);
    pcInfoCache = {
      manufacturer: (d.Manufacturer || '').trim(),
      model: (d.Model || '').trim(),
      ramGB: d.RAM ? Math.round(parseInt(d.RAM) / 1073741824) : null,
      firmware: d.Firmware || 'desconocido',
    };
    return pcInfoCache;
  } catch (e) {
    return { manufacturer: '', model: '', ramGB: null, firmware: 'desconocido' };
  }
});

// ── Inspeccionar una unidad antes de borrarla (qué contiene) ─────────────────
ipcMain.handle('inspect-drive', async (_, driveLetter) => {
  const letter = (driveLetter || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!letter) return { ok: false };
  const root = letter + ':\\';
  const result = { ok: true, letter: letter + ':', label: '', totalGB: null, usedGB: null, freeGB: null, itemCount: 0, items: [], empty: true };

  // Espacio y etiqueta vía WMI (sin -Filter para evitar comillas anidadas: filtro en JS)
  try {
    const raw = execSync(
      'powershell -NoProfile -Command "Get-WmiObject Win32_LogicalDisk | Select-Object DeviceID,VolumeName,Size,FreeSpace | ConvertTo-Json -Compress"',
      { timeout: 8000 }
    ).toString().trim();
    if (raw && raw !== 'null') {
      const all = JSON.parse(raw);
      const list = Array.isArray(all) ? all : [all];
      const d = list.find(x => (x.DeviceID || '').toUpperCase() === letter + ':');
      if (d) {
        result.label = d.VolumeName || '';
        if (d.Size) result.totalGB = Math.round(parseInt(d.Size) / 1073741824 * 10) / 10;
        if (d.FreeSpace != null && d.Size) {
          result.freeGB = Math.round(parseInt(d.FreeSpace) / 1073741824 * 10) / 10;
          result.usedGB = Math.round((parseInt(d.Size) - parseInt(d.FreeSpace)) / 1073741824 * 10) / 10;
        }
      }
    }
  } catch {}

  // Contenido de la raíz (solo nivel superior, rápido)
  try {
    const entries = fs.readdirSync(root, { withFileTypes: true })
      .filter(e => !e.name.startsWith('$') && e.name.toLowerCase() !== 'system volume information');
    result.itemCount = entries.length;
    result.empty = entries.length === 0;
    result.items = entries.slice(0, 8).map(e => ({ name: e.name, dir: e.isDirectory() }));
  } catch {}

  return result;
});

// ── Validar que un archivo es una ISO de Windows válida ──────────────────────
//  Lee el Volume Descriptor ISO9660 (sector 16, offset 0x8000) sin montar nada.
ipcMain.handle('validate-iso', async (_, isoPath) => {
  try {
    const stat = fs.statSync(isoPath);
    const sizeMB = Math.round(stat.size / 1048576);
    if (stat.size < 1.5 * 1024 * 1024 * 1024) {
      return { valid: false, reason: 'too-small', label: '', sizeMB };
    }
    let label = '';
    try {
      const fd = fs.openSync(isoPath, 'r');
      const buf = Buffer.alloc(64);
      // Primary Volume Descriptor: sector 16 = offset 32768; volume id en +40, 32 bytes
      fs.readSync(fd, buf, 0, 64, 32768 + 8);
      fs.closeSync(fd);
      label = buf.slice(32, 64).toString('latin1').trim();
    } catch {}
    // Una ISO de Windows típica tiene labels tipo CCCOMA_..., CES_..., J_CCSA_..., CTOS_..., etc.
    const looksWindows = /[A-Z0-9_]/i.test(label);
    return { valid: true, label, looksWindows, sizeMB };
  } catch (e) {
    return { valid: false, reason: 'not-found', label: '' };
  }
});

// ── ISO picker ────────────────────────────────────────────────────────────────
ipcMain.handle('open-iso-picker', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecciona el archivo ISO de Windows',
    filters: [{ name: 'Imagen ISO', extensions: ['iso'] }],
    properties: ['openFile'],
    defaultPath: app.getPath('downloads'),
  });
  if (result.canceled || !result.filePaths.length) return null;
  const filePath = result.filePaths[0];
  const stat = fs.statSync(filePath);
  if (stat.size < 1.5 * 1024 * 1024 * 1024) {
    return { error: 'El archivo es demasiado pequeño para ser una ISO de Windows válida (mínimo ~2 GB).' };
  }
  return { path: filePath, name: path.basename(filePath), sizeMB: Math.round(stat.size / 1048576) };
});

// ── Open URL in browser ───────────────────────────────────────────────────────
ipcMain.handle('open-url', (_, url) => shell.openExternal(url));

// ── ISO Download ──────────────────────────────────────────────────────────────
// Follows redirects and streams to Downloads folder, reporting progress
function downloadFile(url, destPath, onProgress, onDone, onError) {
  const followRedirect = (currentUrl, redirectCount = 0) => {
    if (redirectCount > 10) { onError('Demasiadas redirecciones. Descarga la ISO manualmente.'); return; }

    const parsed = new URL(currentUrl);
    const proto = parsed.protocol === 'https:' ? https : http;

    const req = proto.get(currentUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        res.resume();
        followRedirect(next, redirectCount + 1);
        return;
      }

      // Detect HTML responses (confirmation pages, anti-bot pages, etc.)
      const contentType = res.headers['content-type'] || '';
      const isGoogleDrive = currentUrl.includes('drive.google.com') || currentUrl.includes('drive.usercontent.google.com');
      if (contentType.includes('text/html')) {
        let html = '';
        res.on('data', c => html += c.toString());
        res.on('end', () => {
          // Strategy 1: add confirm=t if not present (Google Drive large file bypass)
          if (isGoogleDrive && !currentUrl.includes('confirm=t') && !currentUrl.includes('confirm=')) {
            const sep = currentUrl.includes('?') ? '&' : '?';
            followRedirect(currentUrl + sep + 'confirm=t', redirectCount + 1);
            return;
          }
          // Strategy 2: extract confirm token from HTML
          const confirmMatch = html.match(/confirm=([^&"'\s]+)/);
          if (isGoogleDrive && confirmMatch) {
            const fileId = currentUrl.match(/[?&]id=([^&]+)/)?.[1];
            if (fileId) {
              followRedirect(
                `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=${confirmMatch[1]}`,
                redirectCount + 1
              );
              return;
            }
          }
          // Strategy 3: look for any download link in the HTML
          const hrefMatch = html.match(/href="(https:\/\/[^"]*(?:download|uc)[^"]*confirm[^"]*)"/);
          if (hrefMatch) {
            followRedirect(hrefMatch[1].replace(/&amp;/g, '&'), redirectCount + 1);
            return;
          }
          onError('No se pudo descargar directamente. Descárgala manualmente desde el navegador.');
        });
        return;
      }

      if (res.statusCode !== 200) {
        onError(`Error de descarga: código HTTP ${res.statusCode}`);
        return;
      }

      const total = parseInt(res.headers['content-length'] || '0', 10);
      let downloaded = 0;

      // Check free disk space
      const downloadsDir = path.dirname(destPath);
      try {
        const free = getFreeSpace(downloadsDir);
        if (total > 0 && free < total * 1.05) {
          res.resume();
          onError(`Sin espacio suficiente en disco. Necesitas ${Math.round(total / 1073741824 * 1.05 * 10) / 10} GB libres.`);
          return;
        }
      } catch {}

      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);

      res.on('data', chunk => {
        downloaded += chunk.length;
        if (total > 0) onProgress(Math.round((downloaded / total) * 100), downloaded, total);
      });

      fileStream.on('finish', () => {
        fileStream.close();
        // Validate size
        const stat = fs.statSync(destPath);
        if (stat.size < 1.5 * 1024 * 1024 * 1024) {
          fs.unlinkSync(destPath);
          onError(`El archivo recibido no es una ISO válida (${Math.round(stat.size/1024)} KB). Google Drive puede haber bloqueado la descarga directa. Inténtalo de nuevo o descárgala desde el navegador.`);
          return;
        }
        onDone(destPath);
      });

      fileStream.on('error', err => { onError('Error escribiendo el archivo: ' + err.message); });
    });

    req.on('error', err => onError('Error de conexión: ' + err.message));
    req.setTimeout(30000, () => { req.destroy(); onError('Timeout de conexión. Comprueba tu internet.'); });
    activeDownload = req;
  };

  followRedirect(url);
}

function getFreeSpace(dir) {
  try {
    const drive = path.parse(dir).root.replace('\\', '');
    const out = execSync(`powershell -NoProfile -Command "(Get-PSDrive ${drive.replace(':', '')}).Free"`, { timeout: 3000 }).toString().trim();
    return parseInt(out) || 0;
  } catch { return Infinity; }
}

ipcMain.handle('download-iso', async (_, { url, filename }) => {
  const downloadsDir = app.getPath('downloads');
  const destPath = path.join(downloadsDir, filename);

  // If file already exists and is valid, reuse it
  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.size > 1.5 * 1024 * 1024 * 1024) {
      return { status: 'already_exists', path: destPath, name: filename };
    }
    fs.unlinkSync(destPath); // delete partial/corrupt file
  }

  return new Promise((resolve) => {
    downloadFile(
      url,
      destPath,
      (percent, downloaded, total) => {
        mainWindow.webContents.send('download-progress', {
          percent,
          downloadedMB: Math.round(downloaded / 1048576),
          totalMB: Math.round(total / 1048576),
        });
      },
      (filePath) => {
        activeDownload = null;
        resolve({ status: 'done', path: filePath, name: path.basename(filePath) });
      },
      (errMsg) => {
        activeDownload = null;
        resolve({ status: 'error', message: errMsg });
      }
    );
  });
});

ipcMain.handle('cancel-download', () => {
  if (activeDownload) { activeDownload.destroy(); activeDownload = null; }
});

// Carpeta de logs en AppData (userData = %APPDATA%\ruxi\Ruxi-Logs)
function getLogDir() {
  const dir = path.join(app.getPath('userData'), 'Ruxi-Logs');
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  return dir;
}
function getLogPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return path.join(getLogDir(), `ruxi-${stamp}.log`);
}

let lastLogPath = null;

// Evita que el PC se suspenda durante el grabado
function startPowerBlocker() {
  try { if (powerBlockerId === null) powerBlockerId = powerSaveBlocker.start('prevent-display-sleep'); } catch {}
}
function stopPowerBlocker() {
  try { if (powerBlockerId !== null) { powerSaveBlocker.stop(powerBlockerId); powerBlockerId = null; } } catch {}
}

// Notificación del sistema (útil si la ventana está minimizada)
function notify(title, body) {
  try {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: path.join(__dirname, 'renderer', 'assets', 'logo.png'),
      }).show();
    }
  } catch {}
}

// ── Flash USB ─────────────────────────────────────────────────────────────────
ipcMain.handle('start-flash', (_, { isoPath, driveLetter, username }) => {
  const enginePath = getReadyEnginePath();
  if (!fs.existsSync(enginePath)) {
    mainWindow.webContents.send('flash-event', { status: 'error', message: 'rufus-engine.exe no encontrado.' });
    return;
  }
  lastLogPath = getLogPath();
  // Mirror de los eventos JSON de stdout a un archivo aparte
  let eventLog = null;
  try { eventLog = fs.createWriteStream(lastLogPath.replace('.log', '-eventos.log')); } catch {}
  try {
    flashProcess = spawn(enginePath, [
      '--headless', '--iso', isoPath, '--device', driveLetter,
      '--username', username, '--logfile', lastLogPath,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (spawnErr) {
    mainWindow.webContents.send('flash-event', {
      status: 'error',
      message: `No se pudo lanzar el motor: ${spawnErr.message}. Asegúrate de ejecutar Ruxi como administrador.`,
    });
    return;
  }
  // Informar a la UI dónde está el log + evitar que el PC se suspenda
  mainWindow.webContents.send('flash-event', { status: 'log-path', path: lastLogPath });
  startPowerBlocker();
  let notified = false;

  flashProcess.on('error', (err) => {
    flashProcess = null;
    stopPowerBlocker();
    mainWindow.webContents.send('flash-event', {
      status: 'error',
      message: `Error al ejecutar rufus-engine.exe: ${err.message}`,
    });
  });

  let buffer = '';
  flashProcess.stdout.on('data', chunk => {
    const text = chunk.toString();
    if (eventLog) eventLog.write(text);
    buffer += text;
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      let evt;
      try { evt = JSON.parse(t); } catch { continue; }
      mainWindow.webContents.send('flash-event', evt);
      // Notificación del sistema al terminar (una sola vez)
      if (!notified && evt.status === 'done') {
        notified = true;
        stopPowerBlocker();
        notify('✅ ¡USB listo!', 'Ya puedes usar tu USB para instalar Windows.');
      } else if (!notified && evt.status === 'error') {
        notified = true;
        stopPowerBlocker();
        notify('❌ Hubo un problema', evt.message || 'No se pudo completar la grabación.');
      }
    }
  });
  if (flashProcess.stderr) {
    flashProcess.stderr.on('data', chunk => { if (eventLog) eventLog.write(chunk.toString()); });
  }
  flashProcess.on('close', code => {
    flashProcess = null;
    stopPowerBlocker();
    if (eventLog) { try { eventLog.end(); } catch {} }
    if (code !== 0) mainWindow.webContents.send('flash-event', { status: 'error', message: `El proceso terminó inesperadamente (código ${code}).` });
  });
});

// ── Actualizaciones / changelog (GitHub Releases) ────────────────────────────
const GH_REPO = 'PoxiiTV/Ruxi-Custom-Rufus';
function ghGetJson(apiPath) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://api.github.com/repos/${GH_REPO}${apiPath}`, {
      headers: { 'User-Agent': 'Ruxi', 'Accept': 'application/vnd.github+json' },
      timeout: 8000,
    }, (res) => {
      if (res.statusCode !== 200) { res.resume(); reject(new Error('HTTP ' + res.statusCode)); return; }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}
function cmpVersions(a, b) {
  const pa = String(a).replace(/^v/i, '').split('.').map(n => parseInt(n) || 0);
  const pb = String(b).replace(/^v/i, '').split('.').map(n => parseInt(n) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}
ipcMain.handle('check-update', async () => {
  try {
    const rel = await ghGetJson('/releases/latest');
    const latest = rel.tag_name || rel.name || '';
    const hasUpdate = cmpVersions(latest, app.getVersion()) > 0;
    return { ok: true, hasUpdate, latest, url: rel.html_url || `https://github.com/${GH_REPO}/releases` };
  } catch (e) {
    return { ok: false };
  }
});
ipcMain.handle('get-release-notes', async () => {
  try {
    const rel = await ghGetJson('/releases/latest');
    return { ok: true, name: rel.name || rel.tag_name || '', body: rel.body || '', url: rel.html_url || '' };
  } catch (e) {
    return { ok: false };
  }
});

// ── Exportar la guía a PDF ───────────────────────────────────────────────────
ipcMain.handle('export-pdf', async (_, { html, suggestedName }) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar guía de instalación en PDF',
    defaultPath: path.join(app.getPath('desktop'), suggestedName || 'Guia-Ruxi.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });
  if (res.canceled || !res.filePath) return { ok: false };

  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 },
      pageSize: 'A4',
    });
    fs.writeFileSync(res.filePath, pdf);
    win.destroy();
    shell.openPath(res.filePath);
    return { ok: true, path: res.filePath };
  } catch (e) {
    try { win.destroy(); } catch {}
    return { ok: false, error: e.message };
  }
});

// Abrir la carpeta de logs en el Explorador
ipcMain.handle('open-logs', () => {
  if (lastLogPath && fs.existsSync(lastLogPath)) {
    shell.showItemInFolder(lastLogPath);
  } else {
    shell.openPath(getLogDir());
  }
});

ipcMain.handle('cancel-flash', () => {
  if (flashProcess) { flashProcess.kill(); flashProcess = null; }
  stopPowerBlocker();
});
