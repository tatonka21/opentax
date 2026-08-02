import { Link } from "react-router-dom";
import { markets } from "@/lib/mock";
import { formatPrice, formatPercent, formatCompact, cls } from "@/lib/format";
import { ArrowRight, LineChart, ShieldCheck, Wallet2, Zap } from "lucide-react";

const features = [
  {
    icon: LineChart,
    title: "Pro trading",
    body: "Order book, candlesticks, TP/SL and a paper-trading sandbox to practice risk-free.",
  },
  {
    icon: Wallet2,
    title: "Earn & stake",
    body: "Staking, flexible earn, and swap in one place — put your assets to work.",
  },
  {
    icon: Zap,
    title: "AI platform",
    body: "AI assistants and agents for support, analysis and risk monitoring (coming).",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-first",
    body: "KYC, 2FA, AML monitoring and a full backoffice built on OpenDAX.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <section className="pt-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Trade, earn and build on <span className="text-brand-400">OpenTAX</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-400">
          A full enterprise crypto exchange and digital-asset services platform. Spot trading, staking,
          earn, swap and a Web3 suite — all in one place.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/trade/BTC/USDT" className="btn-primary">
            Start trading <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/markets" className="btn-outline">
            Explore markets
          </Link>
        </div>
        <div className="mt-8 flex justify-center gap-8 text-center">
          {[
            ["24", "Markets"],
            ["$1.2B", "24h volume"],
            ["99.98%", "Uptime"],
            ["8", "Staking pools"],
          ].map(([v, l]) => (
            <div key={l}>
              <p className="text-2xl font-bold text-white">{v}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-surface-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-200">Market overview</h2>
          <Link to="/markets" className="text-xs text-brand-400 hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-900">
              <tr className="text-xs uppercase text-slate-500">
                <th className="table-head px-4 py-2">Pair</th>
                <th className="table-head px-4 py-2 text-right">Price</th>
                <th className="table-head px-4 py-2 text-right">24h %</th>
                <th className="table-head px-4 py-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {markets.slice(0, 6).map((m) => (
                <tr key={m.symbol} className="hover:bg-surface-850">
                  <td className="px-4 py-2">
                    <Link to={`/trade/${m.symbol}`} className="font-semibold text-slate-200 hover:text-brand-400">
                      {m.base}/{m.quote}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-300">{formatPrice(m.price)}</td>
                  <td className={cls("px-4 py-2 text-right font-mono", m.change24h >= 0 ? "text-accent-green" : "text-accent-red")}>
                    {formatPercent(m.change24h)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-slate-400">{formatCompact(m.quoteVolume24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-4">
            <Icon className="mb-3 h-6 w-6 text-brand-400" />
            <h3 className="mb-1 font-semibold text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500">{body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-brand-600/30 bg-brand-600/10 p-6 text-center">
        <h2 className="text-lg font-bold text-white">The whole exchange, one suite</h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-400">
          Trading, wallet, earn, staking, swap, launchpad, referral, API and admin — mapped in
          <span className="text-slate-300"> docs/PRODUCTS.md</span>. This is the sandbox UI; it plugs
          into the OpenDAX engine over REST + WebSocket.
        </p>
      </section>
    </div>
  );
}
