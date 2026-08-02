export type Market = {
  symbol: string;
  base: string;
  quote: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  favorite: boolean;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type OrderBookLevel = { price: number; amount: number };
export type OrderBook = { bids: OrderBookLevel[]; asks: OrderBookLevel[] };

export type Trade = {
  id: number;
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: number;
};

export type Balance = {
  currency: string;
  available: number;
  locked: number;
  usdValue: number;
};

export type StakingProduct = {
  id: string;
  name: string;
  symbol: string;
  apr: number;
  min: number;
  term: string;
  flexible: boolean;
  color: string;
};

export type EarnProduct = {
  id: string;
  name: string;
  symbol: string;
  type: "flexible" | "fixed";
  apr: number;
  min: number;
  max: number | null;
  term: string;
};

export type PriceAlert = {
  id: number;
  symbol: string;
  condition: "above" | "below";
  target: number;
  active: boolean;
  triggeredAt: number | null;
};

export type PortfolioAsset = {
  symbol: string;
  value: number;
  change24h: number;
};

export type PaperPosition = {
  id: number;
  symbol: string;
  side: "long" | "short";
  entry: number;
  amount: number;
  openedAt: number;
  tp: number | null;
  sl: number | null;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const SYMBOLS = [
  ["BTC", "USDT", 67420.5],
  ["ETH", "USDT", 3482.1],
  ["SOL", "USDT", 178.4],
  ["XRP", "USDT", 0.6125],
  ["BNB", "USDT", 594.3],
  ["ADA", "USDT", 0.4521],
  ["DOGE", "USDT", 0.1487],
  ["AVAX", "USDT", 37.84],
  ["DOT", "USDT", 7.91],
  ["LINK", "USDT", 17.42],
  ["LTC", "USDT", 84.6],
  ["POL", "USDT", 0.556],
] as const;

export const markets: Market[] = SYMBOLS.map(([base, quote, price]) => {
  const rnd = mulberry32(seedFrom(base));
  const change24h = (rnd() - 0.5) * 16;
  const volume24h = 4_000_000_000 * rnd() + 50_000_000;
  return {
    symbol: `${base}/${quote}`,
    base,
    quote,
    price,
    change24h,
    high24h: price * (1 + (Math.abs(rnd()) * 0.04)),
    low24h: price * (1 - (Math.abs(rnd()) * 0.04)),
    volume24h,
    quoteVolume24h: volume24h * price,
    favorite: base === "BTC" || base === "ETH",
  };
});

export function getMarket(symbol: string): Market {
  return markets.find((m) => m.symbol === symbol) ?? markets[0];
}

export function candles(symbol: string, count = 240): Candle[] {
  const rnd = mulberry32(seedFrom(symbol));
  const market = getMarket(symbol);
  const step = 5 * 60 * 1000;
  const end = Math.floor(Date.now() / step) * step;
  let price = market.price * (1 + (rnd() - 0.5) * 0.2);
  const out: Candle[] = [];
  for (let i = count; i >= 1; i--) {
    const drift = (rnd() - 0.5) * 0.012;
    const wick = rnd() * 0.01;
    const open = price;
    const close = Math.max(0.0000001, open * (1 + drift));
    const high = Math.max(open, close) * (1 + wick);
    const low = Math.min(open, close) * (1 - wick * rnd());
    out.push({
      time: end - i * step,
      open,
      high,
      low,
      close,
      volume: rnd() * 500 + 20,
    });
    price = close;
  }
  return out;
}

export function orderBook(symbol: string, levels = 14): OrderBook {
  const rnd = mulberry32(seedFrom(symbol + "-book"));
  const market = getMarket(symbol);
  const mid = market.price;
  const tick = Math.max(mid * 0.0001, 0.01);
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  let bp = mid * (1 - rnd() * 0.001);
  let ap = mid * (1 + rnd() * 0.001);
  for (let i = 0; i < levels; i++) {
    bp -= tick * (0.4 + rnd());
    bids.push({ price: bp, amount: rnd() * 20 + 0.1 });
    ap += tick * (0.4 + rnd());
    asks.push({ price: ap, amount: rnd() * 20 + 0.1 });
  }
  return { bids, asks };
}

export function trades(symbol: string, count = 20): Trade[] {
  const rnd = mulberry32(seedFrom(symbol + "-trades"));
  const market = getMarket(symbol);
  const out: Trade[] = [];
  let price = market.price;
  const step = 1000;
  const end = Date.now();
  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = rnd() > 0.5 ? "buy" : "sell";
    price = price * (1 + (rnd() - 0.5) * 0.0008);
    out.push({
      id: end + i,
      price,
      amount: rnd() * 2 + 0.001,
      side,
      time: end - (count - i) * step,
    });
  }
  return out;
}

export const balances: Balance[] = [
  { currency: "BTC", available: 0.4812, locked: 0.02, usdValue: 32480 },
  { currency: "ETH", available: 6.24, locked: 0, usdValue: 21720 },
  { currency: "USDT", available: 52840.5, locked: 3000, usdValue: 52840.5 },
  { currency: "SOL", available: 210, locked: 50, usdValue: 37464 },
  { currency: "XRP", available: 8000, locked: 0, usdValue: 4900 },
  { currency: "BNB", available: 12.4, locked: 0, usdValue: 7369 },
];

export const stakingProducts: StakingProduct[] = [
  { id: "eth-stake", name: "Ethereum Staking", symbol: "ETH", apr: 3.8, min: 0.01, term: "Flexible", flexible: true, color: "#627eea" },
  { id: "sol-stake", name: "Solana Staking", symbol: "SOL", apr: 6.9, min: 0.1, term: "Flexible", flexible: true, color: "#14f195" },
  { id: "dot-stake", name: "Polkadot Staking", symbol: "DOT", apr: 11.2, min: 1, term: "28 days", flexible: false, color: "#e6007a" },
  { id: "ada-stake", name: "Cardano Staking", symbol: "ADA", apr: 3.1, min: 10, term: "Flexible", flexible: true, color: "#0033ad" },
  { id: "avax-stake", name: "Avalanche Staking", symbol: "AVAX", apr: 9.4, min: 1, term: "14 days", flexible: false, color: "#e84142" },
  { id: "btc-pos", name: "BTC Yield Vault", symbol: "BTC", apr: 2.4, min: 0.001, term: "Flexible", flexible: true, color: "#f7931a" },
];

export const earnProducts: EarnProduct[] = [
  { id: "usdt-flex", name: "USDT Flexible", symbol: "USDT", type: "flexible", apr: 4.5, min: 1, max: null, term: "Flexible" },
  { id: "usdt-fixed-30", name: "USDT 30-Day", symbol: "USDT", type: "fixed", apr: 7.2, min: 100, max: 50000, term: "30 days" },
  { id: "usdt-fixed-90", name: "USDT 90-Day", symbol: "USDT", type: "fixed", apr: 9.8, min: 100, max: 50000, term: "90 days" },
  { id: "usdc-flex", name: "USDC Flexible", symbol: "USDC", type: "flexible", apr: 4.2, min: 1, max: null, term: "Flexible" },
  { id: "eth-earn", name: "ETH Earn", symbol: "ETH", type: "flexible", apr: 3.2, min: 0.01, max: null, term: "Flexible" },
  { id: "btc-earn", name: "BTC Earn", symbol: "BTC", type: "flexible", apr: 2.1, min: 0.001, max: null, term: "Flexible" },
];

export const alerts: PriceAlert[] = [
  { id: 1, symbol: "BTC/USDT", condition: "above", target: 70000, active: true, triggeredAt: null },
  { id: 2, symbol: "ETH/USDT", condition: "below", target: 3200, active: true, triggeredAt: null },
  { id: 3, symbol: "SOL/USDT", condition: "above", target: 200, active: false, triggeredAt: 1720000000000 },
  { id: 4, symbol: "BTC/USDT", condition: "below", target: 60000, active: true, triggeredAt: null },
];

export const portfolio: PortfolioAsset[] = [
  { symbol: "BTC", value: 32480, change24h: 2.4 },
  { symbol: "ETH", value: 21720, change24h: -1.2 },
  { symbol: "USDT", value: 52840, change24h: 0 },
  { symbol: "SOL", value: 37464, change24h: 5.8 },
  { symbol: "XRP", value: 4900, change24h: 0.6 },
  { symbol: "BNB", value: 7369, change24h: -3.4 },
];

export const positions: PaperPosition[] = [
  { id: 1, symbol: "BTC/USDT", side: "long", entry: 65000, amount: 0.25, openedAt: Date.now() - 86400000 * 2, tp: 72000, sl: 61000 },
  { id: 2, symbol: "SOL/USDT", side: "long", entry: 165, amount: 40, openedAt: Date.now() - 86400000 * 1, tp: 200, sl: 150 },
  { id: 3, symbol: "ETH/USDT", side: "short", entry: 3600, amount: 1.5, openedAt: Date.now() - 86400000 * 4, tp: 3200, sl: 3800 },
];

export const api = {
  getMarkets(): Promise<Market[]> {
    return Promise.resolve(markets);
  },
  getMarket(symbol: string): Promise<Market> {
    return Promise.resolve(getMarket(symbol));
  },
  getCandles(symbol: string, count?: number): Promise<Candle[]> {
    return Promise.resolve(candles(symbol, count));
  },
  getOrderBook(symbol: string): Promise<OrderBook> {
    return Promise.resolve(orderBook(symbol));
  },
  getTrades(symbol: string): Promise<Trade[]> {
    return Promise.resolve(trades(symbol));
  },
  getBalances(): Promise<Balance[]> {
    return Promise.resolve(balances);
  },
};
