import { useState } from "react";
import { markets } from "@/lib/mock";
import { formatPrice, formatNum } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { ArrowDown, ArrowLeftRight, Settings2 } from "lucide-react";

const tokens = markets.map((m) => m.base);
tokens.unshift("USDT", "USDC");

export default function SwapPage() {
  const [from, setFrom] = useState("USDT");
  const [to, setTo] = useState("BTC");
  const [amount, setAmount] = useState("");

  const priceMap = Object.fromEntries(markets.map((m) => [m.base, m.price]));
  const rate = priceMap[from] && priceMap[to] ? priceMap[from] / priceMap[to] : 0;
  const outAmount = amount ? (parseFloat(amount) || 0) * rate : 0;
  const fee = outAmount * 0.003;

  const flip = () => {
    setFrom(to);
    setTo(from);
  };

  const TokenSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) => (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="label mb-0">{label}</label>
        <button className="text-xs text-brand-400 hover:underline">Max</button>
      </div>
      <div className="flex gap-2">
        <select className="input w-36" value={value} onChange={(e) => onChange(e.target.value)}>
          {tokens.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          className="input flex-1 font-mono"
          value={label === "You pay" ? amount : outAmount ? outAmount.toFixed(8) : ""}
          onChange={label === "You pay" ? (e) => setAmount(e.target.value) : undefined}
          readOnly={label !== "You pay"}
          placeholder="0.00"
          inputMode="decimal"
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-white">Swap</h1>
        <button className="ml-auto text-slate-500 hover:text-slate-300"><Settings2 className="h-5 w-5" /></button>
      </div>

      <Card className="p-5">
        <div className="space-y-3">
          <TokenSelect value={from} onChange={setFrom} label="You pay" />
          <div className="flex justify-center">
            <button onClick={flip} className="btn-ghost h-9 w-9 rounded-full border border-surface-700">
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
          <TokenSelect value={to} onChange={setTo} label="You receive" />
        </div>

        <div className="mt-4 rounded-md bg-surface-950 p-3 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Rate</span>
            <span className="font-mono text-slate-300">
              1 {from} ≈ {rate ? formatNum(rate, 8) : "—"} {to}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Price impact</span>
            <span className="font-mono text-accent-green">0.03%</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Fee</span>
            <span className="font-mono text-slate-300">{formatNum(fee, 8)} {to}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span>Est. received</span>
            <span className="font-mono text-slate-200">{formatNum(outAmount - fee, 8)} {to}</span>
          </div>
        </div>

        <button className="btn-primary mt-4 w-full" disabled={!amount}>
          <ArrowDown className="h-4 w-4" /> Swap {from} → {to}
        </button>
        <p className="mt-2 text-center text-[10px] text-slate-600">
          Paper swap via the aggregator API (0x/1inch-style) in production.
        </p>
      </Card>

      <div className="card p-4 text-xs text-slate-500">
        Reference prices: BTC {formatPrice(priceMap.BTC ?? 0)}, ETH {formatPrice(priceMap.ETH ?? 0)}, SOL {formatPrice(priceMap.SOL ?? 0)}.
        Best-route output is shown after a quote fetch.
      </div>
    </div>
  );
}
