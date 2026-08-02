import { portfolio, positions } from "@/lib/mock";
import { formatUsd, formatNum, formatPercent, formatDate, cls } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";

const totalValue = portfolio.reduce((s, a) => s + a.value, 0);
const dayChange = portfolio.reduce((s, a) => s + a.value * (a.change24h / 100), 0);

export default function PortfolioPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-white">Portfolio</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total value</p>
          <p className="mt-1 text-3xl font-bold text-white">{formatUsd(totalValue)}</p>
          <p className={cls("mt-1 text-sm font-medium", dayChange >= 0 ? "text-accent-green" : "text-accent-red")}>
            {formatPercent((dayChange / totalValue) * 100)} today ({formatUsd(dayChange, 0)})
          </p>
          <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
            {portfolio.map((a) => (
              <div
                key={a.symbol}
                style={{
                  width: `${(a.value / totalValue) * 100}%`,
                  background: ["#f7931a", "#627eea", "#26a17b", "#14f195", "#23292f", "#f0b90b"][portfolio.indexOf(a) % 6],
                }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {portfolio.map((a) => (
              <span key={a.symbol} className="text-xs text-slate-500">
                {a.symbol} <span className="text-slate-300">{((a.value / totalValue) * 100).toFixed(1)}%</span>
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Open positions</p>
          <p className="mt-1 text-2xl font-bold text-white">{positions.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            Unrealized P&L{" "}
            <span className="font-mono text-accent-green">+{formatUsd(2841, 0)}</span>
          </p>
          <Link to="/trade/BTC/USDT" className="btn-outline mt-4 w-full">Trade more</Link>
        </Card>
      </div>

      <Card className="overflow-hidden p-0" title="Allocation">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-900">
              <tr className="text-xs uppercase text-slate-500">
                <th className="table-head px-4 py-2">Asset</th>
                <th className="table-head px-4 py-2 text-right">Value</th>
                <th className="table-head px-4 py-2 text-right">Weight</th>
                <th className="table-head px-4 py-2 text-right">24h</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {portfolio.map((a) => (
                <tr key={a.symbol} className="hover:bg-surface-850">
                  <td className="px-4 py-2.5 font-semibold text-slate-200">{a.symbol}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{formatUsd(a.value, 0)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-400">{((a.value / totalValue) * 100).toFixed(1)}%</td>
                  <td className={cls("px-4 py-2.5 text-right font-mono", a.change24h >= 0 ? "text-accent-green" : "text-accent-red")}>
                    {formatPercent(a.change24h)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden p-0" title="Paper positions">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-surface-900">
              <tr className="text-xs uppercase text-slate-500">
                <th className="table-head px-4 py-2">Market</th>
                <th className="table-head px-4 py-2">Side</th>
                <th className="table-head px-4 py-2 text-right">Entry</th>
                <th className="table-head px-4 py-2 text-right">Amount</th>
                <th className="table-head px-4 py-2 text-right">TP</th>
                <th className="table-head px-4 py-2 text-right">SL</th>
                <th className="table-head px-4 py-2">Opened</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {positions.map((p) => (
                <tr key={p.id} className="hover:bg-surface-850">
                  <td className="px-4 py-2.5">
                    <Link to={`/trade/${p.symbol}`} className="font-semibold text-slate-200 hover:text-brand-400">
                      {p.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={p.side === "long" ? "green" : "red"}>{p.side}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{formatNum(p.entry, p.entry < 1000 ? 2 : 0)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{p.amount}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">{p.tp ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">{p.sl ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(p.openedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
