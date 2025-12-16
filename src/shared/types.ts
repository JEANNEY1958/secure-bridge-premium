export interface TradeSignal {
  type: "trade";
  action: "BUY" | "SELL";
  symbol: string;
  quantity: number;
  orderType: "market" | "limit";
  limitPrice?: number;
  pairId: number;
  side: "base" | "quote";
}

export interface AuthMessage {
  type: "auth";
  payload: {
    secret: string;
    version: string;
    tradingMode: "paper" | "live";
  };
}

export interface HeartbeatMessage {
  type: "heartbeat";
}

export interface TradeResultMessage {
  type: "trade_result";
  payload: {
    success: boolean;
    orderId?: string;
    error?: string;
    signal: TradeSignal;
  };
}

export type OutgoingMessage = AuthMessage | HeartbeatMessage | TradeResultMessage;

export interface AuthSuccessMessage {
  type: "auth_success";
  payload: {
    clientId: string;
  };
}

export interface AuthFailedMessage {
  type: "auth_failed";
  payload: {
    error: string;
  };
}

export interface HeartbeatAckMessage {
  type: "heartbeat_ack";
}

export type IncomingMessage = AuthSuccessMessage | AuthFailedMessage | HeartbeatAckMessage | TradeSignal;

export interface AlpacaCredentials {
  paperApiKey: string;
  paperSecretKey: string;
  liveApiKey: string;
  liveSecretKey: string;
}

export interface BridgeConfig {
  serverUrl: string;
  authSecret: string;
  tradingMode: "paper" | "live";
  autoConnect: boolean;
}

export interface ConnectionStatus {
  connected: boolean;
  clientId?: string;
  lastHeartbeat?: Date;
  error?: string;
}
