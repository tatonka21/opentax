import { useState } from "react";
import { alerts as seedAlerts, markets } from "@/lib/mock";
import { formatPrice, formatUsd, cls } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Bell, Plus, Trash2 } from "lucide-react";
import type { PriceAlert } from "@/lib/mock";

export default function AlertsPage() {
  const [items, setItems] = useState<PriceAlert[]>(seedAlerts);
  const [symbol, setSymbol] = useState("BTC/USDT");
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [target, setTarget] = useState("");

  const add = () => {
    const t = parseFloat(target);
    if (!t) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), symbol, condition, target: t, active: true, triggeredAt: null },
    ]);
    setTarget("");
  };

  const remove = (id: number) => setItems((prev) => prev.filter((a) => a.id !== id));
  const toggle = (id: number) =>
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));

  const priceFor = (s: string) => markets.find((m) => m.symbol === s)?.price ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Bell className="h-5 w-5 text-brand-400" />
        <h1 className="text-xl font-bold text-white">Price alerts</h1>
      </div>

      <Card className="p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Market</label>
            <select className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {markets.map((m) => (
                <option key={m.symbol} value={m.symbol}>{m.symbol}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select
              className="input"
              value={condition}
              onChange={(e) => setCondition(e.target.value as "above" | "below")}
            >
              <option value="above">Price rises above</option>
              <option value="below">Price falls below</option>
            </select>
          </div>
          <div>
            <label className="label">Target ({symbol.split("/")[1]})</label>
            <input className="input font-mono" value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder={String(priceFor(symbol))} />
          </div>
          <div className="flex items-end">
            <button onClick={add} className="btn-primary w-full">
              <Plus className="h-4 w-4" /> Add alert
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Current {symbol} price ≈ {formatPrice(priceFor(symbol))}. Alerts fire via web push / email in production.
        </p>
      </Card>

      <Card className="overflow-hidden p-0" title={`Your alerts (${items.length})`}>
        <ul className="divide-y divide-surface-800/60">
          {items.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-850">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200">
                  {a.symbol}
                  <span className={cls("ml-2 text-xs font-medium", a.condition === "above" ? "text-accent-green" : "text-accent-red")}>
                    {a.condition === "above" ? "↑ above" : "↓ below"}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Target {formatUsd(a.target, a.target < 1 ? 4 : 2)} — current {formatPrice(priceFor(a.symbol))}
                </p>
              </div>
              {a.triggeredAt && <Badge tone="yellow">Triggered</Badge>}
              <button
                onClick={() => toggle(a.id)}
                className={cls("btn-outline px-2 py-1 text-xs", !a.active && "opacity-50")}
              >
                {a.active ? "On" : "Off"}
              </button>
              <button onClick={() => remove(a.id)} className="text-slate-600 hover:text-accent-red">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-slate-500">No alerts yet. Add one above.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
