import WebSocket from "ws";
import type { BridgeConfig, TradeSignal, ConnectionStatus, OutgoingMessage, IncomingMessage } from "../shared/types";

interface BridgeCallbacks {
  onConnected: (clientId: string) => void;
  onDisconnected: (error?: string) => void;
  onTradeSignal: (signal: TradeSignal) => void;
  onHeartbeat: () => void;
}

export class BridgeClient {
  private ws: WebSocket | null = null;
  private config: BridgeConfig;
  private callbacks: BridgeCallbacks;
  private clientId: string | null = null;
  private lastHeartbeat: Date | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;

  constructor(config: BridgeConfig, callbacks: BridgeCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.config.serverUrl.replace(/^http/, "ws") + "/bridge";
        console.log(`[BridgeClient] Connecting to ${wsUrl}`);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.on("open", () => {
          console.log("[BridgeClient] WebSocket connected, authenticating...");
          this.authenticate();
        });

        this.ws.on("message", (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString()) as IncomingMessage;
            this.handleMessage(message, resolve, reject);
          } catch (error) {
            console.error("[BridgeClient] Failed to parse message:", error);
          }
        });

        this.ws.on("close", (code, reason) => {
          console.log(`[BridgeClient] Disconnected: ${code} - ${reason}`);
          this.cleanup();
          this.callbacks.onDisconnected(reason.toString() || `Connection closed (${code})`);
          this.scheduleReconnect();
        });

        this.ws.on("error", (error) => {
          console.error("[BridgeClient] WebSocket error:", error);
          this.isConnecting = false;
          reject(error);
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private authenticate(): void {
    const authMessage: OutgoingMessage = {
      type: "auth",
      payload: {
        secret: this.config.authSecret,
        version: "1.0.0",
        tradingMode: this.config.tradingMode,
      },
    };
    this.send(authMessage);
  }

  private handleMessage(message: IncomingMessage, resolve?: () => void, reject?: (error: Error) => void): void {
    switch (message.type) {
      case "auth_success":
        console.log(`[BridgeClient] Authenticated as ${message.payload.clientId}`);
        this.clientId = message.payload.clientId;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.callbacks.onConnected(message.payload.clientId);
        resolve?.();
        break;

      case "auth_failed":
        console.error(`[BridgeClient] Authentication failed: ${message.payload.error}`);
        this.isConnecting = false;
        this.disconnect();
        reject?.(new Error(message.payload.error));
        break;

      case "heartbeat_ack":
        this.lastHeartbeat = new Date();
        this.callbacks.onHeartbeat();
        break;

      case "trade":
        console.log(`[BridgeClient] Received trade signal: ${message.action} ${message.symbol}`);
        this.callbacks.onTradeSignal(message);
        break;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "heartbeat" });
      }
    }, 15000);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[BridgeClient] Max reconnect attempts reached");
      return;
    }

    if (!this.config.autoConnect) {
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[BridgeClient] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error("[BridgeClient] Reconnect failed:", error);
      });
    }, delay);
  }

  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.clientId = null;
    this.lastHeartbeat = null;
  }

  disconnect(): void {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(message: OutgoingMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendTradeResult(signal: TradeSignal, success: boolean, orderId?: string, error?: string): void {
    this.send({
      type: "trade_result",
      payload: { success, orderId, error, signal },
    } as any);
  }

  getStatus(): ConnectionStatus {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN && !!this.clientId,
      clientId: this.clientId || undefined,
      lastHeartbeat: this.lastHeartbeat || undefined,
    };
  }
}
