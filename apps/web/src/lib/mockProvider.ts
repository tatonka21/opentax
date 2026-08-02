import { markets, candles, orderBook, trades, getMarket } from "./mock";
import type { MarketDataProvider, ConnState } from "./provider";

export class MockProvider implements MarketDataProvider {
  getMarkets() {
    return Promise.resolve(markets);
  }
  getKlines(symbol: string, count = 240) {
    return Promise.resolve(candles(symbol, count));
  }
  getOrderBook(symbol: string, levels = 14) {
    return Promise.resolve(orderBook(symbol, levels));
  }
  getTrades(symbol: string, count = 20) {
    return Promise.resolve(trades(symbol, count));
  }
  getTicker(symbol: string) {
    return Promise.resolve(getMarket(symbol));
  }
  getTickers() {
    return Promise.resolve(markets);
  }
  setActiveSymbol() {}
  subscribeCandle() {
    return () => {};
  }
  subscribeTrade() {
    return () => {};
  }
  subscribeDepth() {
    return () => {};
  }
  subscribeTicker() {
    return () => {};
  }
  onStatus(cb: (s: ConnState) => void) {
    cb("demo");
    return () => {};
  }
  dispose() {}
}
