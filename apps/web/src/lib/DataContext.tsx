import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Candle, OrderBook, Trade, Market } from "./mock";
import { MockProvider } from "./mockProvider";
import { KrakenProvider } from "./kraken";
import type { MarketDataProvider, ConnState } from "./provider";

export type Mode = "live" | "demo";

type DataCtx = {
  provider: MarketDataProvider;
  mode: Mode;
  conn: ConnState;
  setMode: (m: Mode) => void;
};

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      return localStorage.getItem("opentax-data-mode") === "demo" ? "demo" : "live";
    } catch {
      return "live";
    }
  });
  const [provider, setProvider] = useState<MarketDataProvider>(() => new MockProvider());
  const [conn, setConn] = useState<ConnState>(mode === "demo" ? "demo" : "connecting");

  useEffect(() => {
    if (mode === "demo") {
      setProvider(new MockProvider());
      setConn("demo");
      return;
    }
    const p = new KrakenProvider();
    setProvider(p);
    setConn("connecting");
    const off = p.onStatus((s) => setConn(s));
    return () => {
      off();
      p.dispose();
    };
  }, [mode]);

  const setMode = (m: Mode) => {
    try {
      localStorage.setItem("opentax-data-mode", m);
    } catch {
      /* ignore */
    }
    setModeState(m);
  };

  const value = useMemo(() => ({ provider, mode, conn, setMode }), [provider, mode, conn]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData(): DataCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

/** Latest price/24h stats for every market, updated live. */
export function useTickerMap(): Record<string, Market> {
  const { provider } = useData();
  const [map, setMap] = useState<Record<string, Market>>({});
  useEffect(() => {
    let cancelled = false;
    provider.getTickers().then((ts) => {
      if (cancelled) return;
      setMap((m) => (m[ts[0]?.symbol]?.price === ts[0]?.price ? m : Object.fromEntries(ts.map((t) => [t.symbol, t]))));
    });
    const off = provider.subscribeTicker((t) => {
      setMap((m) => {
        const cur = m[t.symbol];
        if (cur && cur.price === t.price) return m;
        return { ...m, [t.symbol]: t };
      });
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [provider]);
  return map;
}

/** Candles for a symbol, seeded via REST and updated live via the WS ohlc stream. */
export function useKlines(symbol: string, intervalMin: number, count = 240): Candle[] {
  const { provider } = useData();
  const [klines, setKlines] = useState<Candle[]>([]);
  useEffect(() => {
    let cancelled = false;
    provider.setActiveSymbol(symbol, intervalMin);
    setKlines([]);
    provider.getKlines(symbol, count, intervalMin).then((k) => {
      if (!cancelled) setKlines(k);
    });
    const off = provider.subscribeCandle(symbol, (c) => {
      setKlines((prev) => {
        if (prev.length === 0) return [c];
        const last = prev[prev.length - 1];
        if (c.time === last.time) {
          const next = prev.slice();
          next[next.length - 1] = c;
          return next;
        }
        if (c.time > last.time) {
          const next = prev.concat(c);
          return next.length > count ? next.slice(next.length - count) : next;
        }
        return prev;
      });
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [provider, symbol, intervalMin, count]);
  return klines;
}

/** Level-2 order book, snapshotted via REST then kept live via the WS book stream. */
export function useOrderBook(symbol: string, levels = 20): OrderBook {
  const { provider } = useData();
  const [book, setBook] = useState<OrderBook>({ bids: [], asks: [] });
  useEffect(() => {
    let cancelled = false;
    provider.getOrderBook(symbol, levels).then((b) => {
      if (!cancelled) setBook(b);
    });
    const off = provider.subscribeDepth(symbol, (b) => setBook(b));
    return () => {
      cancelled = true;
      off();
    };
  }, [provider, symbol, levels]);
  return book;
}

/** Recent trades, newest-first, appended live. */
export function useTrades(symbol: string, count = 30): Trade[] {
  const { provider } = useData();
  const [list, setList] = useState<Trade[]>([]);
  useEffect(() => {
    let cancelled = false;
    provider.getTrades(symbol, count).then((t) => {
      if (!cancelled) setList(t);
    });
    const off = provider.subscribeTrade(symbol, (t) => {
      setList((prev) => {
        if (prev.length > 0 && prev[0].time === t.time && prev[0].price === t.price) return prev;
        const next = [t, ...prev];
        return next.length > count ? next.slice(0, count) : next;
      });
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [provider, symbol, count]);
  return list;
}
