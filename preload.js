const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    startDownload: (data) => ipcRenderer.invoke('start-download', data),
    cancelDownload: () => ipcRenderer.invoke('cancel-download'),
    onProgress: (callback) => {
        ipcRenderer.on('download-progress', (event, data) => callback(data));
    }
});