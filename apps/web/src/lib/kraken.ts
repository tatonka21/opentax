import { getMarket, markets as mockMarkets, candles as mockCandles, orderBook as mockBook, trades as mockTrades } from "./mock";
import type { Candle, OrderBook, Trade, Market } from "./mock";
import type { MarketDataProvider, ConnState } from "./provider";

const REST = "https://api.kraken.com/0/public";
const WS_URL = "wss://ws.kraken.com";

const PAIRS: Record<string, string> = {
  "BTC/USDT": "XBT/USD",
  "ETH/USDT": "ETH/USD",
  "SOL/USDT": "SOL/USD",
  "XRP/USDT": "XRP/USD",
  "BNB/USDT": "BNB/USD",
  "ADA/USDT": "ADA/USD",
  "DOGE/USDT": "XDG/USD",
  "AVAX/USDT": "AVAX/USD",
  "DOT/USDT": "DOT/USD",
  "LINK/USDT": "LINK/USD",
  "LTC/USDT": "LTC/USD",
  "POL/USDT": "POL/USD",
};

function pairOf(symbol: string): string | null {
  return PAIRS[symbol] ?? null;
}

function wsToSymbol(pair: string): string {
  for (const [s, p] of Object.entries(PAIRS)) if (p === pair) return s;
  return pair;
}

function matchKey(key: string, pair: string): boolean {
  const [b, q] = pair.split("/");
  const norm = key.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return norm.includes(b) && norm.endsWith(q);
}

function findKey(result: Record<string, unknown>, pair: string): string | null {
  for (const k of Object.keys(result)) if (matchKey(k, pair)) return k;
  return null;
}

const num = (s: unknown): number =>
  typeof s === "string" ? parseFloat(s) : typeof s === "number" ? s : Number.NaN;

async function getJson(path: string): Promise<{ result: Record<string, unknown>; error: string[] }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(`${REST}/${path}`, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    if (Array.isArray(j.error) && j.error.length) throw new Error(j.error.join(", "));
    return j;
  } finally {
    clearTimeout(t);
  }
}

type BookSide = Map<string, number>;
type Book = { bids: BookSide; asks: BookSide };
type Cb<T> = (v: T) => void;

export class KrakenProvider implements MarketDataProvider {
  private ws: WebSocket | null = null;
  private activeSymbol = "BTC/USDT";
  private activeInterval = 5;
  private currentOhlc: { symbol: string; interval: number } = { symbol: "", interval: 0 };
  private subSet = new Set<string>();
  private queue: Array<() => void> = [];
  private flushing = false;
  private tickerMap = new Map<string, Market>();
  private bookMap = new Map<string, Book>();
  private status: ConnState = "connecting";
  private statusCbs = new Set<Cb<ConnState>>();
  private candleCbs = new Map<string, Set<Cb<Candle>>>();
  private tradeCbs = new Map<string, Set<Cb<Trade>>>();
  private depthCbs = new Map<string, Set<Cb<OrderBook>>>();
  private tickerCbs = new Set<Cb<Market>>();
  private reconnectTimer: number | null = null;
  private disposed = false;

  constructor() {
    this.connect();
  }

  // ---- status ----

  private setStatus(s: ConnState) {
    if (this.status === s) return;
    this.status = s;
    this.statusCbs.forEach((cb) => cb(s));
  }

  onStatus(cb: Cb<ConnState>): () => void {
    this.statusCbs.add(cb);
    cb(this.status);
    return () => {
      this.statusCbs.delete(cb);
    };
  }

  dispose() {
    this.disposed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try {
      this.ws?.close();
    } catch {
      /* ignore */
    }
    this.ws = null;
    this.queue = [];
    this.statusCbs.clear();
  }

  // ---- connection ----

  private connect() {
    if (this.disposed) return;
    this.setStatus("connecting");
    let ws: WebSocket;
    try {
      ws = new WebSocket(WS_URL);
    } catch {
      this.setStatus("offline");
      this.scheduleReconnect();
      return;
    }
    this.ws = ws;
    ws.onopen = () => {
      this.queue = [];
      this.subSet.clear();
      this.subscribeAll();
    };
    ws.onmessage = (ev) => this.handle(String(ev.data));
    ws.onerror = () => {};
    ws.onclose = () => {
      if (this.disposed) return;
      this.queue = [];
      this.setStatus("offline");
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.disposed || this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  private send(raw: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(raw);
  }

  // ---- rate-limited subscription queue (Kraken: ~1 msg/sec) ----

  private pushSubscribe(msg: object) {
    this.queue.push(() => this.send(JSON.stringify(msg)));
    this.flush();
  }

  private flush() {
    if (this.flushing || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.flushing = true;
    const next = () => {
      if (this.disposed) return;
      const job = this.queue.shift();
      if (!job) {
        this.flushing = false;
        return;
      }
      job();
      setTimeout(next, 1100);
    };
    next();
  }

  private subscribe(channel: string, param: number | null, symbols: string[]) {
    const pairs: string[] = [];
    const fresh: string[] = [];
    for (const s of symbols) {
      const p = pairOf(s);
      if (!p) continue;
      const key = `${s}|${channel}|${param ?? ""}`;
      if (this.subSet.has(key)) continue;
      this.subSet.add(key);
      fresh.push(s);
      pairs.push(p);
    }
    if (!fresh.length) return;
    const subscription =
      channel === "ticker"
        ? { name: "ticker" }
        : channel === "book"
          ? { name: "book", depth: param }
          : channel === "ohlc"
            ? { name: "ohlc", interval: param }
            : { name: "trade" };
    this.pushSubscribe({ event: "subscribe", pair: pairs, subscription });
  }

  private unsubscribe(channel: string, param: number | null, symbols: string[]) {
    const pairs: string[] = [];
    for (const s of symbols) {
      const p = pairOf(s);
      if (!p) continue;
      this.subSet.delete(`${s}|${channel}|${param ?? ""}`);
      pairs.push(p);
    }
    if (!pairs.length) return;
    const subscription =
      channel === "book"
        ? { name: "book", depth: param }
        : channel === "ohlc"
          ? { name: "ohlc", interval: param }
          : { name: "trade" };
    this.pushSubscribe({ event: "unsubscribe", pair: pairs, subscription });
  }

  setActiveSymbol(symbol: string, intervalMin = 5) {
    const prev = this.currentOhlc;
    if (prev.symbol === symbol && prev.interval === intervalMin) {
      this.activeSymbol = symbol;
      this.activeInterval = intervalMin;
      return;
    }
    this.activeSymbol = symbol;
    this.activeInterval = intervalMin;
    if (prev.symbol === symbol) {
      this.unsubscribe("ohlc", prev.interval, [symbol]);
    } else {
      if (prev.symbol) this.unsubscribe("ohlc", prev.interval, [prev.symbol]);
      this.subscribe("book", 25, [symbol]);
      this.subscribe("trade", null, [symbol]);
    }
    this.subscribe("ohlc", intervalMin, [symbol]);
    this.currentOhlc = { symbol, interval: intervalMin };
  }

  private subscribeAll() {
    this.subscribe("ticker", null, Object.keys(PAIRS));
    this.subscribe("book", 25, [this.activeSymbol]);
    this.subscribe("trade", null, [this.activeSymbol]);
    this.subscribe("ohlc", this.activeInterval, [this.activeSymbol]);
    this.currentOhlc = { symbol: this.activeSymbol, interval: this.activeInterval };
  }

  // ---- ws message routing ----

  private handle(raw: string) {
    let msg: unknown;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    if (!Array.isArray(msg)) {
      const sys = msg as { event?: string; status?: string };
      if (sys.event === "systemStatus" && sys.status === "online") this.setStatus("live");
      return;
    }
    const data = msg[1];
    const channelName = String(msg[2] ?? "");
    const pair = String(msg[3] ?? "");
    const symbol = wsToSymbol(pair);
    if (!PAIRS[symbol]) return;
    if (channelName === "ticker") this.handleTicker(symbol, data);
    else if (channelName.startsWith("book")) this.handleBook(symbol, data);
    else if (channelName.startsWith("ohlc")) this.handleOhlc(symbol, data);
    else if (channelName === "trade") this.handleTrade(symbol, data);
  }

  private buildMarket(symbol: string, d: Record<string, unknown>): Market | null {
    const base = getMarket(symbol);
    const c = d.c as unknown[] | undefined;
    const o = d.o as unknown[] | undefined;
    const h = d.h as unknown[] | undefined;
    const l = d.l as unknown[] | undefined;
    const v = d.v as unknown[] | undefined;
    const last = num(c?.[0]);
    const open = num(o?.[1]);
    const high = num(h?.[1]);
    const low = num(l?.[1]);
    const volume = num(v?.[1]);
    const ok = (n: number) => Number.isFinite(n) && n > 0;
    if (!ok(last) && !ok(open)) return null;
    const price = ok(last) ? last : base.price;
    return {
      ...base,
      price,
      high24h: ok(high) ? high : base.high24h,
      low24h: ok(low) ? low : base.low24h,
      volume24h: ok(volume) ? volume : base.volume24h,
      quoteVolume24h: ok(volume) ? volume * price : base.quoteVolume24h,
      change24h: ok(open) && ok(last) ? ((last - open) / open) * 100 : base.change24h,
    };
  }

  private handleTicker(symbol: string, d: unknown) {
    const m = this.buildMarket(symbol, d as Record<string, unknown>);
    if (!m) return;
    this.tickerMap.set(symbol, m);
    this.tickerCbs.forEach((cb) => cb(m));
  }

  private handleOhlc(symbol: string, d: unknown) {
    if (!Array.isArray(d)) return;
    const [t, , o, h, l, c, , v] = d;
    const candle: Candle = {
      time: Number(t) * 1000,
      open: num(o),
      high: num(h),
      low: num(l),
      close: num(c),
      volume: num(v),
    };
    this.candleCbs.get(symbol)?.forEach((cb) => cb(candle));
  }

  private handleBook(symbol: string, d: unknown) {
    const rec = d as { a?: unknown; b?: unknown; as?: unknown; bs?: unknown };
    let book = this.bookMap.get(symbol);
    if (!book) {
      book = { bids: new Map(), asks: new Map() };
      this.bookMap.set(symbol, book);
    }
    if (Array.isArray(rec.as) && Array.isArray(rec.bs)) {
      book.bids.clear();
      book.asks.clear();
      this.applyLevels(book.bids, rec.bs);
      this.applyLevels(book.asks, rec.as);
    } else {
      this.applyLevels(book.bids, rec.b);
      this.applyLevels(book.asks, rec.a);
    }
    this.emitBook(symbol, book);
  }

  private applyLevels(side: BookSide, entries: unknown) {
    if (!Array.isArray(entries)) return;
    for (const e of entries) {
      const price = num(Array.isArray(e) ? e[0] : undefined);
      const amount = num(Array.isArray(e) ? e[1] : undefined);
      if (!Number.isFinite(price)) continue;
      const key = price.toFixed(8);
      if (!Number.isFinite(amount) || amount <= 0) side.delete(key);
      else side.set(key, amount);
    }
  }

  private emitBook(symbol: string, book: Book) {
    const asks = [...book.asks.entries()]
      .map(([k, v]) => ({ price: parseFloat(k), amount: v }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 25);
    const bids = [...book.bids.entries()]
      .map(([k, v]) => ({ price: parseFloat(k), amount: v }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 25);
    const out: OrderBook = { bids, asks };
    this.depthCbs.get(symbol)?.forEach((cb) => cb(out));
  }

  private handleTrade(symbol: string, d: unknown) {
    if (!Array.isArray(d)) return;
    d.forEach((t, i) => {
      if (!Array.isArray(t)) return;
      const [price, amount, time, side] = t;
      this.tradeCbs.get(symbol)?.forEach((cb) =>
        cb({
          id: `${time}-${i}`,
          price: num(price),
          amount: num(amount),
          side: side === "buy" ? "buy" : "sell",
          time: Number(time) * 1000,
        }),
      );
    });
  }

  // ---- subscription registration (JS-level, deduped per symbol) ----

  private add(map: Map<string, Set<Cb<never>>>, symbol: string, cb: Cb<never>): () => void {
    const set = map.get(symbol) ?? new Set();
    set.add(cb);
    map.set(symbol, set);
    return () => {
      set.delete(cb);
    };
  }

  subscribeCandle(symbol: string, cb: Cb<Candle>): () => void {
    return this.add(this.candleCbs as Map<string, Set<Cb<never>>>, symbol, cb as Cb<never>);
  }

  subscribeTrade(symbol: string, cb: Cb<Trade>): () => void {
    return this.add(this.tradeCbs as Map<string, Set<Cb<never>>>, symbol, cb as Cb<never>);
  }

  subscribeDepth(symbol: string, cb: Cb<OrderBook>): () => void {
    return this.add(this.depthCbs as Map<string, Set<Cb<never>>>, symbol, cb as Cb<never>);
  }

  subscribeTicker(cb: Cb<Market>): () => void {
    this.tickerCbs.add(cb);
    return () => {
      this.tickerCbs.delete(cb);
    };
  }

  // ---- REST (with mock fallback) ----

  getMarkets(): Promise<Market[]> {
    return Promise.resolve(Object.keys(PAIRS).map((s) => getMarket(s)));
  }

  async getKlines(symbol: string, count = 240, intervalMin = 5): Promise<Candle[]> {
    const pair = pairOf(symbol);
    if (!pair) return mockCandles(symbol, count);
    try {
      const j = await getJson(`OHLC?pair=${pair.replace("/", "")}&interval=${intervalMin}`);
      const key = findKey(j.result, pair);
      if (!key) throw new Error("no OHLC");
      const rows = j.result[key] as unknown[][];
      const out: Candle[] = rows.map((r) => ({
        time: Number(r[0]) * 1000,
        open: num(r[1]),
        high: num(r[2]),
        low: num(r[3]),
        close: num(r[4]),
        volume: num(r[6]),
      }));
      return out.slice(-count);
    } catch {
      return mockCandles(symbol, count);
    }
  }

  async getOrderBook(symbol: string, levels = 20): Promise<OrderBook> {
    const pair = pairOf(symbol);
    if (!pair) return mockBook(symbol, levels);
    try {
      const j = await getJson(`Depth?pair=${pair.replace("/", "")}&count=${levels}`);
      const key = findKey(j.result, pair);
      if (!key) throw new Error("no depth");
      const d = j.result[key] as { bids?: unknown[]; asks?: unknown[] };
      const toLevel = (e: unknown) => {
        const r = e as unknown[];
        return { price: num(r[0]), amount: num(r[1]) };
      };
      return { bids: (d.bids ?? []).map(toLevel), asks: (d.asks ?? []).map(toLevel) };
    } catch {
      return mockBook(symbol, levels);
    }
  }

  async getTrades(symbol: string, count = 30): Promise<Trade[]> {
    const pair = pairOf(symbol);
    if (!pair) return mockTrades(symbol, count);
    try {
      const j = await getJson(`Trades?pair=${pair.replace("/", "")}`);
      const key = findKey(j.result, pair);
      if (!key) throw new Error("no trades");
      const rows = j.result[key] as unknown[][];
      return rows
        .slice(-count)
        .reverse()
        .map((r, i) => ({
          id: `${r[2]}-${i}`,
          price: num(r[0]),
          amount: num(r[1]),
          side: r[3] === "buy" ? "buy" : "sell",
          time: Number(r[2]) * 1000,
        }));
    } catch {
      return mockTrades(symbol, count);
    }
  }

  async getTicker(symbol: string): Promise<Market> {
    const cached = this.tickerMap.get(symbol);
    const pair = pairOf(symbol);
    if (!pair) return cached ?? getMarket(symbol);
    try {
      const j = await getJson(`Ticker?pair=${pair.replace("/", "")}`);
      const key = findKey(j.result, pair);
      if (!key) throw new Error("no ticker");
      const m = this.buildMarket(symbol, j.result[key] as Record<string, unknown>);
      if (m) {
        this.tickerMap.set(symbol, m);
        return m;
      }
      throw new Error("bad ticker");
    } catch {
      return cached ?? getMarket(symbol);
    }
  }

  async getTickers(): Promise<Market[]> {
    const symbols = Object.keys(PAIRS);
    try {
      const pairStr = symbols.map((s) => pairOf(s)!.replace("/", "")).join(",");
      const j = await getJson(`Ticker?pair=${pairStr}`);
      const out: Market[] = [];
      for (const s of symbols) {
        const key = findKey(j.result, pairOf(s)!);
        if (!key) continue;
        const m = this.buildMarket(s, j.result[key] as Record<string, unknown>);
        if (m) out.push(m);
      }
      if (out.length) {
        out.forEach((m) => this.tickerMap.set(m.symbol, m));
        return out;
      }
      throw new Error("no tickers");
    } catch {
      if (this.tickerMap.size) return symbols.map((s) => this.tickerMap.get(s) ?? getMarket(s));
      return mockMarkets;
    }
  }
}
