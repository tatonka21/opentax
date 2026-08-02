import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { markets, candles } from "@/lib/mock";
import { formatPrice, formatPercent, formatCompact, formatUsd, cls } from "@/lib/format";
import { Sparkline } from "@/components/ui/Sparkline";
import { Star, Search } from "lucide-react";
import type { Market } from "@/lib/mock";

type SortKey = "symbol" | "price" | "change24h" | "high24h" | "low24h" | "quoteVolume24h";

export default function MarketsPage() {
  const [q, setQ] = useState("");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set(markets.filter((m) => m.favorite).map((m) => m.symbol)));
  const [sortKey, setSortKey] = useState<SortKey>("quoteVolume24h");
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const filtered = markets.filter((m) => {
      if (onlyFavs && !favs.has(m.symbol)) return false;
      const s = q.trim().toLowerCase();
      if (!s) return true;
      return m.symbol.toLowerCase().includes(s) || m.base.toLowerCase().includes(s) || m.quote.toLowerCase().includes(s);
    });
    const sign = asc ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" || typeof bv === "string") return String(av).localeCompare(String(bv)) * sign;
      return ((av as number) - (bv as number)) * sign;
    });
  }, [q, onlyFavs, favs, sortKey, asc]);

  const toggleFav = (m: Market) =>
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(m.symbol) ? next.delete(m.symbol) : next.add(m.symbol);
      return next;
    });

  const head = (key: SortKey, label: string, right = false) => (
    <th
      className={cls("table-head cursor-pointer select-none py-2 pr-3", right && "text-right")}
      onClick={() => {
        if (sortKey === key) setAsc((v) => !v);
        else {
          setSortKey(key);
          setAsc(false);
        }
      }}
    >
      {label}
      <span className="ml-1 text-slate-600">{sortKey === key ? (asc ? "▲" : "▼") : ""}</span>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-white">Markets</h1>
        <div className="relative ml-auto w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <input className="input pl-8" placeholder="Search BTC, ETH…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button
          onClick={() => setOnlyFavs((v) => !v)}
          className={cls(
            "btn-outline",
            onlyFavs && "border-accent-yellow/50 text-accent-yellow",
          )}
        >
          <Star className="h-4 w-4" fill={onlyFavs ? "currentColor" : "none"} /> Favorites
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-surface-800 bg-surface-900">
              <tr>
                <th className="py-2 pl-3" />
                {head("symbol", "Pair")}
                {head("price", "Last Price", true)}
                {head("change24h", "24h Change", true)}
                {head("high24h", "24h High", true)}
                {head("low24h", "24h Low", true)}
                {head("quoteVolume24h", "24h Volume", true)}
                <th className="table-head py-2 pr-3 text-right">Last 24h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {rows.map((m) => (
                <tr key={m.symbol} className="transition-colors hover:bg-surface-850">
                  <td className="py-2 pl-3">
                    <button onClick={() => toggleFav(m)} className="text-slate-600 hover:text-accent-yellow">
                      <Star className="h-4 w-4" fill={favs.has(m.symbol) ? "currentColor" : "none"} />
                    </button>
                  </td>
                  <td className="py-2">
                    <Link to={`/trade/${m.symbol}`} className="font-semibold text-slate-200 hover:text-brand-400">
                      {m.base}/{m.quote}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-mono text-slate-200">{formatPrice(m.price)}</td>
                  <td className={cls("py-2 text-right font-mono", m.change24h >= 0 ? "text-accent-green" : "text-accent-red")}>
                    {formatPercent(m.change24h)}
                  </td>
                  <td className="py-2 text-right font-mono text-slate-400">{formatPrice(m.high24h)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{formatPrice(m.low24h)}</td>
                  <td className="py-2 text-right font-mono text-slate-400">{formatCompact(m.quoteVolume24h)}</td>
                  <td className="py-2 pr-3 text-right">
                    <Sparkline
                      values={candles(m.symbol, 24).map((c) => c.close)}
                      positive={m.change24h >= 0}
                      width={80}
                      height={22}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No markets match “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-600">Mock market data for the paper-trading sandbox. Total: {formatUsd(1.2e9, 0)} traded 24h.</p>
    </div>
  );
}
