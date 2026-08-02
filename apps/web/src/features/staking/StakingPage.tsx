import { useState } from "react";
import { stakingProducts } from "@/lib/mock";
import { formatUsd, cls } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function StakingPage() {
  const [selected, setSelected] = useState(stakingProducts[0].id);
  const product = stakingProducts.find((p) => p.id === selected)!;
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">Staking</h1>
        <Badge tone="blue">1-step</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stakingProducts.map((p) => {
            const active = p.id === selected;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={cls(
                  "card p-4 text-left transition-all",
                  active ? "border-brand-500 ring-1 ring-brand-500" : "hover:border-surface-600",
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-surface-950" style={{ background: p.color }}>
                    {p.symbol.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.term}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">
                  {p.apr}%<span className="ml-1 text-xs font-medium text-slate-500">APR</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Min {p.min} {p.symbol} • {p.flexible ? "Flexible" : "Fixed"}
                </p>
              </button>
            );
          })}
        </div>

        <Card title="Stake now" className="h-fit">
          <p className="mb-3 text-sm text-slate-400">
            {product.name} — {product.apr}% APR
          </p>
          <label className="label">Amount ({product.symbol})</label>
          <input className="input font-mono" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" />
          <div className="mt-3 space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Estimated annual reward</span>
              <span className="font-mono text-accent-green">
                {amount ? formatUsd((parseFloat(amount) || 0) * 0, 2) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Unlock</span>
              <span>{product.term}</span>
            </div>
          </div>
          <button className="btn-primary mt-4 w-full">Stake {product.symbol}</button>
          <p className="mt-2 text-center text-[10px] text-slate-600">Paper mode — no real funds move.</p>
        </Card>
      </div>
    </div>
  );
}
