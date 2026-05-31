const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let flashProcess = null;

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
app.on('window-all-closed', () => app.quit());

// ── Window controls ──────────────────────────────────────────────────────────
ipcMain.handle('window-minimize', () => mainWindow.minimize());
ipcMain.handle('window-close', () => {
  if (flashProcess) flashProcess.kill();
  app.quit();
});

// ── USB detection ─────────────────────────────────────────────────────────────
ipcMain.handle('list-usb-drives', async () => {
  try {
    const ps = `Get-WmiObject Win32_DiskDrive | Where-Object { $_.InterfaceType -eq 'USB' } | ForEach-Object { $d=$_; $letters=@(); $ps=Get-WmiObject -Query "ASSOCIATORS OF {Win32_DiskDrive.DeviceID='$($d.DeviceID -replace '\\\\','\\\\\\\\' )'} WHERE AssocClass=Win32_DiskDriveToDiskPartition"; foreach($p in $ps){$ls=Get-WmiObject -Query "ASSOCIATORS OF {Win32_DiskPartition.DeviceID='$($p.DeviceID)'} WHERE AssocClass=Win32_LogicalDiskToPartition"; foreach($l in $ls){$letters+=$l.DeviceID}}; [PSCustomObject]@{Model=$d.Model;Size=$d.Size;Letters=$letters} } | ConvertTo-Json -Compress`;
    const raw = execSync(`powershell -NoProfile -Command "${ps}"`, { timeout: 10000 }).toString().trim();
    if (!raw || raw === 'null') return [];
    const data = JSON.parse(raw);
    const drives = Array.isArray(data) ? data : [data];
    return drives.filter(d => d && d.Size).map(d => {
      const letters = Array.isArray(d.Letters) ? d.Letters : (d.Letters ? [d.Letters] : []);
      const sizeGB = Math.round(parseInt(d.Size || 0) / 1073741824);
      return { model: d.Model || 'USB Drive', sizeGB, letters, label: `${d.Model || 'USB'} — ${sizeGB} GB`, tooSmall: sizeGB < 8 };
    });
  } catch { return []; }
});

// ── ISO picker ────────────────────────────────────────────────────────────────
ipcMain.handle('open-iso-picker', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Selecciona el archivo ISO de Windows',
    filters: [{ name: 'Imagen ISO', extensions: ['iso'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const filePath = result.filePaths[0];
  const stat = fs.statSync(filePath);
  if (stat.size < 1.5 * 1024 * 1024 * 1024) return { path: filePath, error: 'El archivo es demasiado pequeño para ser una ISO de Windows válida.' };
  return { path: filePath, name: path.basename(filePath), sizeMB: Math.round(stat.size / 1048576) };
});

// ── Open URL ──────────────────────────────────────────────────────────────────
ipcMain.handle('open-url', (_, url) => shell.openExternal(url));

// ── Flash USB ─────────────────────────────────────────────────────────────────
ipcMain.handle('start-flash', (_, { isoPath, driveLetter, username }) => {
  const enginePath = getEnginePath();
  if (!fs.existsSync(enginePath)) {
    mainWindow.webContents.send('flash-event', { status: 'error', message: 'rufus-engine.exe no encontrado. Compila el motor primero.' });
    return;
  }
  flashProcess = spawn(enginePath, ['--headless', '--iso', isoPath, '--device', driveLetter, '--username', username], { stdio: ['ignore', 'pipe', 'pipe'] });
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
    if (code !== 0) mainWindow.webContents.send('flash-event', { status: 'error', message: `Proceso terminó con código ${code}.` });
  });
});

ipcMain.handle('cancel-flash', () => { if (flashProcess) { flashProcess.kill(); flashProcess = null; } });
