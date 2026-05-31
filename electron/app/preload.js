const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ruxi', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  close: () => ipcRenderer.invoke('window-close'),

  // USB detection
  listUsbDrives: () => ipcRenderer.invoke('list-usb-drives'),

  // ISO picker
  openIsoPicker: () => ipcRenderer.invoke('open-iso-picker'),

  // Open URL in system browser
  openUrl: (url) => ipcRenderer.invoke('open-url', url),

  // Flash
  startFlash: (opts) => ipcRenderer.invoke('start-flash', opts),
  cancelFlash: () => ipcRenderer.invoke('cancel-flash'),

  // Flash progress events
  onFlashEvent: (cb) => {
    ipcRenderer.on('flash-event', (_, data) => cb(data));
  },
  offFlashEvents: () => {
    ipcRenderer.removeAllListeners('flash-event');
  },
});
