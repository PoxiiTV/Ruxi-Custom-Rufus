const { app, BrowserWindow, ipcMain, dialog, shell, net } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const http = require('http');

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

// ── Drive detection — muestra TODOS los discos excepto C: y CD-ROM ───────────
ipcMain.handle('list-usb-drives', async () => {
  try {
    // Simple, reliable query — no multiline, no complex escaping
    const raw = execSync(
      'powershell -NoProfile -Command "Get-WmiObject Win32_LogicalDisk | Select-Object DeviceID,VolumeName,Size,DriveType | ConvertTo-Json -Compress"',
      { timeout: 10000 }
    ).toString().trim();

    if (!raw || raw === 'null') return [];
    const data = JSON.parse(raw);
    const disks = Array.isArray(data) ? data : [data];

    return disks
      .filter(d => {
        if (!d || !d.DeviceID) return false;
        if (d.DriveType === 5) return false;        // CD-ROM
        if (d.DeviceID === 'C:') return false;       // disco del sistema
        if (!d.Size || parseInt(d.Size) === 0) return false;
        return true;
      })
      .map(d => {
        const sizeGB = Math.round(parseInt(d.Size) / 1073741824);
        const label = d.VolumeName || '';
        const isRemovable = d.DriveType === 2;
        const icon = isRemovable ? '💾' : '🖥️';
        const typeTag = isRemovable ? 'USB' : 'Disco';
        const displayName = label
          ? `${icon} ${label} (${d.DeviceID}) — ${typeTag}`
          : `${icon} ${d.DeviceID} — ${typeTag} ${sizeGB} GB`;
        return {
          model: label || d.DeviceID,
          sizeGB,
          letters: [d.DeviceID],
          label: displayName,
          tooSmall: sizeGB < 8,
          driveType: d.DriveType,
        };
      });
  } catch (e) {
    return [];
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
  // Informar a la UI dónde está el log
  mainWindow.webContents.send('flash-event', { status: 'log-path', path: lastLogPath });

  flashProcess.on('error', (err) => {
    flashProcess = null;
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
      try { mainWindow.webContents.send('flash-event', JSON.parse(t)); } catch {}
    }
  });
  if (flashProcess.stderr) {
    flashProcess.stderr.on('data', chunk => { if (eventLog) eventLog.write(chunk.toString()); });
  }
  flashProcess.on('close', code => {
    flashProcess = null;
    if (eventLog) { try { eventLog.end(); } catch {} }
    if (code !== 0) mainWindow.webContents.send('flash-event', { status: 'error', message: `El proceso terminó inesperadamente (código ${code}).` });
  });
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
});
