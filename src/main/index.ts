import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { BridgeClient } from "./bridge-client";
import { KeyVault } from "./key-vault";
import { AlpacaExecutor } from "./alpaca-executor";
import type { BridgeConfig, AlpacaCredentials, TradeSignal } from "../shared/types";

let mainWindow: BrowserWindow | null = null;
let bridgeClient: BridgeClient | null = null;
let keyVault: KeyVault;
let alpacaExecutor: AlpacaExecutor | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hiddenInset",
    backgroundColor: "#1a1a2e",
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  keyVault = new KeyVault();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (bridgeClient) {
    bridgeClient.disconnect();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("get-config", async () => {
  return keyVault.getConfig();
});

ipcMain.handle("save-config", async (_, config: BridgeConfig) => {
  keyVault.saveConfig(config);
  return true;
});

ipcMain.handle("get-credentials", async () => {
  const creds = keyVault.getCredentials();
  return {
    hasPaperKeys: !!(creds?.paperApiKey && creds?.paperSecretKey),
    hasLiveKeys: !!(creds?.liveApiKey && creds?.liveSecretKey),
  };
});

ipcMain.handle("save-credentials", async (_, credentials: AlpacaCredentials) => {
  keyVault.saveCredentials(credentials);
  return true;
});

ipcMain.handle("connect", async () => {
  const config = keyVault.getConfig();
  if (!config) {
    return { success: false, error: "No configuration found" };
  }

  const credentials = keyVault.getCredentials();
  if (!credentials) {
    return { success: false, error: "No API credentials found" };
  }

  alpacaExecutor = new AlpacaExecutor(credentials, config.tradingMode);

  bridgeClient = new BridgeClient(config, {
    onConnected: (clientId) => {
      mainWindow?.webContents.send("connection-status", { connected: true, clientId });
    },
    onDisconnected: (error) => {
      mainWindow?.webContents.send("connection-status", { connected: false, error });
    },
    onTradeSignal: async (signal: TradeSignal) => {
      mainWindow?.webContents.send("trade-signal", signal);
      
      if (alpacaExecutor) {
        try {
          const result = await alpacaExecutor.executeOrder(signal);
          bridgeClient?.sendTradeResult(signal, true, result.id);
          mainWindow?.webContents.send("trade-result", { success: true, orderId: result.id, signal });
        } catch (error: any) {
          bridgeClient?.sendTradeResult(signal, false, undefined, error.message);
          mainWindow?.webContents.send("trade-result", { success: false, error: error.message, signal });
        }
      }
    },
    onHeartbeat: () => {
      mainWindow?.webContents.send("heartbeat", new Date().toISOString());
    },
  });

  try {
    await bridgeClient.connect();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("disconnect", async () => {
  if (bridgeClient) {
    bridgeClient.disconnect();
    bridgeClient = null;
  }
  return true;
});

ipcMain.handle("get-connection-status", async () => {
  if (!bridgeClient) {
    return { connected: false };
  }
  return bridgeClient.getStatus();
});

ipcMain.handle("test-alpaca", async () => {
  const config = keyVault.getConfig();
  const credentials = keyVault.getCredentials();
  
  if (!config || !credentials) {
    return { success: false, error: "Missing configuration or credentials" };
  }

  const executor = new AlpacaExecutor(credentials, config.tradingMode);
  return executor.testConnection();
});
