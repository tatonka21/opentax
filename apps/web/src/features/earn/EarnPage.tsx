import { earnProducts } from "@/lib/mock";
import { formatUsd, formatNum, cls } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

export default function EarnPage() {
  const [tab, setTab] = useState<"flexible" | "fixed">("flexible");
  const list = earnProducts.filter((p) => p.type === tab);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">Earn</h1>
        <Badge tone="yellow">Interest</Badge>
      </div>

      <div className="flex gap-1 rounded-md bg-surface-900 p-1 sm:w-fit">
        {(["flexible", "fixed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cls(
              "rounded px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === t ? "bg-surface-700 text-white" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-100">{p.name}</p>
                <p className="text-xs text-slate-500">{p.symbol} • {p.term}</p>
              </div>
              <Badge tone={p.type === "flexible" ? "blue" : "yellow"}>{p.type}</Badge>
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              {p.apr}%<span className="text-xs font-medium text-slate-500"> APR</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Min {formatNum(p.min)} {p.symbol}
              {p.max ? ` • Max ${formatUsd(p.max, 0)}` : " • No max"}
            </p>
            <button className="btn-outline mt-4 w-full">Subscribe</button>
          </Card>
        ))}
      </div>

      <p className="text-xs text-slate-600">
        APRs are indicative. Flexible products can redeem anytime; fixed products redeem at maturity.
      </p>
    </div>
  );
}
