import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Expose protected methods that allow the renderer process to use
  // the ipcRenderer without exposing the entire object
});
