import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMarket, markets, candles } from "@/lib/mock";
import { formatPrice, formatPercent, formatCompact, cls } from "@/lib/format";
import { BookOpen, CandlestickChart as ChartIcon, Star } from "lucide-react";
import CandlestickChart from "./CandlestickChart";
import { OrderBookPanel } from "./OrderBookPanel";
import { TradeFeed } from "./TradeFeed";
import OrderForm from "./OrderForm";
import { Card } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { useTickerMap, useKlines, useOrderBook, useTrades } from "@/lib/DataContext";

const INTERVALS: Record<string, number> = { "1m": 1, "5m": 5, "15m": 15, "1H": 60, "4H": 240, "1D": 1440 };
const RANGES = Object.keys(INTERVALS);

export default function TradePage() {
  const { symbol } = useParams();
  const safe = symbol ?? "BTC/USDT";
  const staticMarket = getMarket(safe);
  const [tab, setTab] = useState<"book" | "trades">("book");
  const [range, setRange] = useState("5m");

  const tickers = useTickerMap();
  const market = tickers[safe] ?? staticMarket;
  const klines = useKlines(safe, INTERVALS[range], 240);
  const book = useOrderBook(safe, 20);
  const trades = useTrades(safe, 30);
  const [base, quote] = safe.split("/");

  const stats = [
    { label: "24h Change", value: formatPercent(market.change24h), up: market.change24h >= 0 },
    { label: "24h High", value: formatPrice(market.high24h) },
    { label: "24h Low", value: formatPrice(market.low24h) },
    { label: "24h Volume", value: `${formatCompact(market.quoteVolume24h)} ${quote}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <Star className="h-5 w-5 text-accent-yellow" fill="currentColor" />
          <div>
            <h1 className="text-lg font-bold text-white">{safe}</h1>
            <p className="text-xs text-slate-500">{base} • Spot</p>
          </div>
        </div>
        <div className="text-2xl font-bold font-mono text-white">{formatPrice(market.price)}</div>
        <span className={cls("text-sm font-medium", market.change24h >= 0 ? "text-accent-green" : "text-accent-red")}>
          {formatPercent(market.change24h)}
        </span>
        <div className="ml-auto flex gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">{s.label}</p>
              <p className={cls("font-mono text-sm", s.up === undefined ? "text-slate-200" : s.up ? "text-accent-green" : "text-accent-red")}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-surface-800 px-4 py-2">
            <div className="flex items-center gap-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cls(
                    "rounded px-2 py-1 text-xs font-medium",
                    range === r ? "bg-surface-700 text-white" : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <ChartIcon className="h-4 w-4" />
              <span className="text-xs">candlestick</span>
            </div>
          </div>
          <div className="p-2">
            <CandlestickChart candles={klines} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-0">
            <div className="grid grid-cols-2 gap-1 border-b border-surface-800 p-1">
              {(["book", "trades"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cls(
                    "flex items-center justify-center gap-1.5 rounded py-1.5 text-sm font-medium",
                    tab === t ? "bg-surface-700 text-white" : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {t === "book" ? <BookOpen className="h-3.5 w-3.5" /> : <ChartIcon className="h-3.5 w-3.5" />}
                  {t === "book" ? "Order Book" : "Trades"}
                </button>
              ))}
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {tab === "book" ? <OrderBookPanel book={book} /> : <TradeFeed trades={trades} />}
            </div>
          </Card>

          <Card title="Place order" className="p-3">
            <OrderForm symbol={safe} price={market.price} />
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketsNear(safe).map((m) => {
          const live = tickers[m.symbol];
          const row = live ?? m;
          return (
            <Link key={m.symbol} to={`/trade/${m.symbol}`} className="card p-3 transition-colors hover:border-surface-600">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-200">{m.base}/{m.quote}</span>
                <span className={cls("font-mono", row.change24h >= 0 ? "text-accent-green" : "text-accent-red")}>
                  {formatPrice(row.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{formatPercent(row.change24h)}</span>
                <Sparkline
                  values={candles(m.symbol, 24).map((c) => c.close)}
                  positive={row.change24h >= 0}
                  width={72}
                  height={20}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function marketsNear(safe: string) {
  const idx = markets.findIndex((m) => m.symbol === safe);
  if (idx === -1) return markets.slice(0, 4);
  return [...markets.slice(idx), ...markets.slice(0, idx)].slice(0, 4);
}
