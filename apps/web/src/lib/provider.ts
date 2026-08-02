import type { Candle, OrderBook, Trade, Market } from "./mock";

export type ConnState = "connecting" | "live" | "offline" | "demo";

export interface MarketDataProvider {
  getMarkets(): Promise<Market[]>;
  getKlines(symbol: string, count?: number, intervalMin?: number): Promise<Candle[]>;
  getOrderBook(symbol: string, levels?: number): Promise<OrderBook>;
  getTrades(symbol: string, count?: number): Promise<Trade[]>;
  getTicker(symbol: string): Promise<Market>;
  getTickers(): Promise<Market[]>;
  setActiveSymbol(symbol: string, intervalMin?: number): void;
  subscribeCandle(symbol: string, cb: (c: Candle) => void): () => void;
  subscribeTrade(symbol: string, cb: (t: Trade) => void): () => void;
  subscribeDepth(symbol: string, cb: (b: OrderBook) => void): () => void;
  subscribeTicker(cb: (m: Market) => void): () => void;
  onStatus(cb: (s: ConnState) => void): () => void;
  dispose(): void;
}
