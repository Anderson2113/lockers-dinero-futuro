const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getWhatsAppQR: (tenantId) => ipcRenderer.invoke('get-whatsapp-qr', tenantId),
  desvincularWhatsApp: (tenantId) => ipcRenderer.invoke('desvincular-whatsapp', tenantId),
});
