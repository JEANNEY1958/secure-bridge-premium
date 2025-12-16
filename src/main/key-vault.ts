import Store from "electron-store";
import { machineIdSync } from "node-machine-id";
import * as crypto from "crypto";
import type { AlpacaCredentials, BridgeConfig } from "../shared/types";

interface VaultSchema {
  config?: BridgeConfig;
  credentials?: AlpacaCredentials;
}

function generateMachineKey(): string {
  try {
    const machineId = machineIdSync();
    return crypto.createHash("sha256").update(machineId + "xchange-suite-v1").digest("hex").substring(0, 32);
  } catch {
    return crypto.randomBytes(16).toString("hex");
  }
}

export class KeyVault {
  private store: Store<VaultSchema>;

  constructor() {
    this.store = new Store<VaultSchema>({
      name: "secure-bridge-vault",
      encryptionKey: generateMachineKey(),
      clearInvalidConfig: true,
    });
  }

  getConfig(): BridgeConfig | null {
    return this.store.get("config") || null;
  }

  saveConfig(config: BridgeConfig): void {
    this.store.set("config", config);
  }

  getCredentials(): AlpacaCredentials | null {
    return this.store.get("credentials") || null;
  }

  saveCredentials(credentials: AlpacaCredentials): void {
    this.store.set("credentials", credentials);
  }

  clearAll(): void {
    this.store.clear();
  }

  hasCredentials(): boolean {
    const creds = this.getCredentials();
    return !!(creds?.paperApiKey || creds?.liveApiKey);
  }

  hasConfig(): boolean {
    const config = this.getConfig();
    return !!(config?.serverUrl && config?.authSecret);
  }
}
