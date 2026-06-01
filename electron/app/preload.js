const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ruxi', {
  minimize: () => ipcRenderer.invoke('window-minimize'),
  close: () => ipcRenderer.invoke('window-close'),

  listUsbDrives: () => ipcRenderer.invoke('list-usb-drives'),
  getPcInfo: () => ipcRenderer.invoke('get-pc-info'),
  inspectDrive: (letter) => ipcRenderer.invoke('inspect-drive', letter),
  validateIso: (path) => ipcRenderer.invoke('validate-iso', path),

  openIsoPicker: () => ipcRenderer.invoke('open-iso-picker'),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),

  // In-app ISO download
  downloadIso: (opts) => ipcRenderer.invoke('download-iso', opts),
  cancelDownload: () => ipcRenderer.invoke('cancel-download'),
  onDownloadProgress: (cb) => ipcRenderer.on('download-progress', (_, d) => cb(d)),
  offDownloadProgress: () => ipcRenderer.removeAllListeners('download-progress'),

  startFlash: (opts) => ipcRenderer.invoke('start-flash', opts),
  cancelFlash: () => ipcRenderer.invoke('cancel-flash'),
  onFlashEvent: (cb) => ipcRenderer.on('flash-event', (_, d) => cb(d)),
  offFlashEvents: () => ipcRenderer.removeAllListeners('flash-event'),

  openLogs: () => ipcRenderer.invoke('open-logs'),
  exportPdf: (opts) => ipcRenderer.invoke('export-pdf', opts),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  getReleaseNotes: () => ipcRenderer.invoke('get-release-notes'),
});
