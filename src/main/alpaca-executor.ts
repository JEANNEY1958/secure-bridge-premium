import type { AlpacaCredentials, TradeSignal } from "../shared/types";

interface AlpacaOrder {
  id: string;
  status: string;
  symbol: string;
  qty: string;
  side: string;
  type: string;
  filled_qty: string;
}

interface AlpacaAccount {
  id: string;
  status: string;
  buying_power: string;
  equity: string;
}

export class AlpacaExecutor {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(credentials: AlpacaCredentials, tradingMode: "paper" | "live") {
    if (tradingMode === "paper") {
      this.apiKey = credentials.paperApiKey;
      this.secretKey = credentials.paperSecretKey;
      this.baseUrl = "https://paper-api.alpaca.markets";
    } else {
      this.apiKey = credentials.liveApiKey;
      this.secretKey = credentials.liveSecretKey;
      this.baseUrl = "https://api.alpaca.markets";
    }
  }

  private async request<T>(endpoint: string, method: string = "GET", body?: object): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        "APCA-API-KEY-ID": this.apiKey,
        "APCA-API-SECRET-KEY": this.secretKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Alpaca API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async testConnection(): Promise<{ success: boolean; account?: AlpacaAccount; error?: string }> {
    try {
      const account = await this.request<AlpacaAccount>("/v2/account");
      return { 
        success: true, 
        account: {
          id: account.id,
          status: account.status,
          buying_power: account.buying_power,
          equity: account.equity,
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async executeOrder(signal: TradeSignal): Promise<AlpacaOrder> {
    console.log(`[AlpacaExecutor] Executing: ${signal.action} ${signal.quantity} ${signal.symbol}`);

    const orderBody: any = {
      symbol: signal.symbol,
      qty: signal.quantity.toString(),
      side: signal.action.toLowerCase(),
      type: signal.orderType,
      time_in_force: "day",
    };

    if (signal.orderType === "limit" && signal.limitPrice) {
      orderBody.limit_price = signal.limitPrice.toString();
    }

    const order = await this.request<AlpacaOrder>("/v2/orders", "POST", orderBody);
    console.log(`[AlpacaExecutor] Order placed: ${order.id} - ${order.status}`);
    
    return order;
  }

  async getAccount(): Promise<AlpacaAccount> {
    return this.request<AlpacaAccount>("/v2/account");
  }

  async getPositions(): Promise<any[]> {
    return this.request<any[]>("/v2/positions");
  }
}
