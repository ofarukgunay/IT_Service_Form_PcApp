const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Menüden gelenler
  onMenuNewForm: (callback) => ipcRenderer.on("menu-new-form", callback),
  onMenuSaveForm: (callback) => ipcRenderer.on("menu-save-form", callback),
  onMenuExportPDF: (callback) => ipcRenderer.on("menu-export-pdf", callback),
  onTriggerPrint: (callback) => ipcRenderer.on("trigger-print", callback),

  // Dinleyici temizleme
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});
