import { useState } from "react";
import { balances } from "@/lib/mock";
import { formatNum, formatUsd } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowDownLeft, ArrowUpRight, Copy } from "lucide-react";

const total = balances.reduce((s, b) => s + b.usdValue, 0);

export default function WalletPage() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Wallet</h1>
          <p className="text-sm text-slate-500">Total balance</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="btn-green"><ArrowDownLeft className="h-4 w-4" /> Deposit</button>
          <button className="btn-outline"><ArrowUpRight className="h-4 w-4" /> Withdraw</button>
        </div>
      </div>

      <div className="card p-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">Estimated balance</p>
        <p className="mt-1 text-3xl font-bold text-white">{formatUsd(total, 2)}</p>
        <p className="mt-1 text-xs text-slate-500">≈ {formatUsd(total * 1.021, 0)} (24h change +2.1%)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Available</p>
          <p className="mt-1 text-lg font-bold text-white">{formatUsd(total - 3070, 0)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Locked in orders</p>
          <p className="mt-1 text-lg font-bold text-white">{formatUsd(3020, 0)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">In Earn & Staking</p>
          <p className="mt-1 text-lg font-bold text-accent-yellow">{formatUsd(18400, 0)}</p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0" title="Balances">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-900">
              <tr className="text-xs uppercase text-slate-500">
                <th className="table-head px-4 py-2">Asset</th>
                <th className="table-head px-4 py-2 text-right">Available</th>
                <th className="table-head px-4 py-2 text-right">Locked</th>
                <th className="table-head px-4 py-2 text-right">Total</th>
                <th className="table-head px-4 py-2 text-right">Value (USD)</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/60">
              {balances.map((b) => (
                <tr key={b.currency} className="hover:bg-surface-850">
                  <td className="px-4 py-2.5 font-semibold text-slate-200">{b.currency}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{formatNum(b.available, b.currency === "USDT" ? 2 : 4)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">{formatNum(b.locked, b.currency === "USDT" ? 2 : 4)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{formatNum(b.available + b.locked, b.currency === "USDT" ? 2 : 4)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-200">{formatUsd(b.usdValue, 0)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={copy} title="Copy deposit address" className="text-slate-500 hover:text-slate-300">
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {copied && <p className="px-4 pb-3 text-xs text-accent-green">Deposit address copied to clipboard.</p>}
      </Card>

      <div className="card p-4 text-sm text-slate-500">
        <Badge tone="blue" className="mr-2">Note</Badge>
        Deposits/withdrawals and transfers connect to the OpenDAX wallet engine via the Barong/Peatio API.
      </div>
    </div>
  );
}
