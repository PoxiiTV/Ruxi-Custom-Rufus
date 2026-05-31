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

// ── USB detection (logical disk → partition → physical drive) ─────────────────
ipcMain.handle('list-usb-drives', async () => {
  try {
    // Query from the logical disk side — much more reliable for letter detection
    const ps = `
$disks = Get-WmiObject Win32_LogicalDisk | Where-Object { $_.DriveType -eq 2 }
$result = @()
foreach ($d in $disks) {
  $part = Get-WmiObject -Query "ASSOCIATORS OF {Win32_LogicalDisk.DeviceID='$($d.DeviceID)'} WHERE AssocClass=Win32_LogicalDiskToPartition" | Select-Object -First 1
  $model = 'USB Drive'
  $totalSize = $d.Size
  if ($part) {
    $phys = Get-WmiObject -Query "ASSOCIATORS OF {Win32_DiskPartition.DeviceID='$($part.DeviceID)'} WHERE AssocClass=Win32_DiskDriveToDiskPartition" | Select-Object -First 1
    if ($phys) { $model = $phys.Model; $totalSize = $phys.Size }
  }
  $result += [PSCustomObject]@{
    Letter = $d.DeviceID
    Label  = if ($d.VolumeName) { $d.VolumeName } else { '' }
    Size   = $totalSize
    Model  = $model
  }
}
if ($result.Count -eq 0) { '[]' } else { $result | ConvertTo-Json -Compress }
`.trim();

    const raw = execSync(`powershell -NoProfile -Command "${ps}"`, { timeout: 12000 }).toString().trim();
    if (!raw || raw === 'null' || raw === '[]') return [];
    const data = JSON.parse(raw);
    const drives = Array.isArray(data) ? data : [data];

    return drives.filter(d => d && d.Size).map(d => {
      const sizeGB = Math.round(parseInt(d.Size || 0) / 1073741824);
      const label = d.Label ? `${d.Model} — ${d.Label} (${d.Letter})` : `${d.Model} (${d.Letter})`;
      return {
        model: d.Model || 'USB Drive',
        sizeGB,
        letters: [d.Letter],
        label,
        tooSmall: sizeGB < 8,
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

      // Google Drive confirmation page detection
      if (currentUrl.includes('drive.google.com') && res.headers['content-type']?.includes('text/html')) {
        let html = '';
        res.on('data', c => html += c.toString());
        res.on('end', () => {
          // Extract confirm token
          const match = html.match(/confirm=([^&"]+)/);
          if (match) {
            const fileId = currentUrl.match(/id=([^&]+)/)?.[1];
            if (fileId) {
              followRedirect(
                `https://drive.google.com/uc?export=download&confirm=${match[1]}&id=${fileId}`,
                redirectCount + 1
              );
              return;
            }
          }
          onError('No se pudo iniciar la descarga de Google Drive. Descárgala manualmente.');
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
          onError('El archivo descargado es demasiado pequeño. La descarga puede haber fallado.');
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

// ── Flash USB ─────────────────────────────────────────────────────────────────
ipcMain.handle('start-flash', (_, { isoPath, driveLetter, username }) => {
  const enginePath = getEnginePath();
  if (!fs.existsSync(enginePath)) {
    mainWindow.webContents.send('flash-event', { status: 'error', message: 'rufus-engine.exe no encontrado.' });
    return;
  }
  flashProcess = spawn(enginePath, [
    '--headless', '--iso', isoPath, '--device', driveLetter, '--username', username
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let buffer = '';
  flashProcess.stdout.on('data', chunk => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue;
      try { mainWindow.webContents.send('flash-event', JSON.parse(t)); } catch {}
    }
  });
  flashProcess.on('close', code => {
    flashProcess = null;
    if (code !== 0) mainWindow.webContents.send('flash-event', { status: 'error', message: `El proceso terminó inesperadamente (código ${code}).` });
  });
});

ipcMain.handle('cancel-flash', () => {
  if (flashProcess) { flashProcess.kill(); flashProcess = null; }
});
