import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("bridge", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (config: any) => ipcRenderer.invoke("save-config", config),
  getCredentials: () => ipcRenderer.invoke("get-credentials"),
  saveCredentials: (credentials: any) => ipcRenderer.invoke("save-credentials", credentials),
  connect: () => ipcRenderer.invoke("connect"),
  disconnect: () => ipcRenderer.invoke("disconnect"),
  getConnectionStatus: () => ipcRenderer.invoke("get-connection-status"),
  testAlpaca: () => ipcRenderer.invoke("test-alpaca"),
  
  onConnectionStatus: (callback: (status: any) => void) => {
    ipcRenderer.on("connection-status", (_, status) => callback(status));
  },
  onTradeSignal: (callback: (signal: any) => void) => {
    ipcRenderer.on("trade-signal", (_, signal) => callback(signal));
  },
  onTradeResult: (callback: (result: any) => void) => {
    ipcRenderer.on("trade-result", (_, result) => callback(result));
  },
  onHeartbeat: (callback: (timestamp: string) => void) => {
    ipcRenderer.on("heartbeat", (_, timestamp) => callback(timestamp));
  },
});
