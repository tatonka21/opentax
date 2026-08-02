import { useMemo, useState } from "react";
import { cls } from "@/lib/format";
import { formatPrice, formatNum } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

type OrderType = "limit" | "market";
type Side = "buy" | "sell";

export default function OrderForm({ symbol, price }: { symbol: string; price: number }) {
  const [type, setType] = useState<OrderType>("limit");
  const [side, setSide] = useState<Side>("buy");
  const [amount, setAmount] = useState("");
  const [limit, setLimit] = useState(price.toFixed(2));
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [showProtect, setShowProtect] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);

  const amt = parseFloat(amount) || 0;
  const px = type === "limit" ? parseFloat(limit) || 0 : price;
  const total = amt * px;
  const available = side === "buy" ? 55840.5 : 0.4812;
  const [base, quote] = symbol.split("/");
  const balanceLabel = side === "buy" ? quote : base;

  const maxAmount = useMemo(() => (side === "buy" ? available / px : available), [side, available, px]);

  const submit = () => {
    if (!amt) return;
    const t = type === "limit" ? `${limit} ${quote}` : "market";
    setPlaced(`${side.toUpperCase()} ${type} ${amt.toFixed(4)} ${base} @ ${t}`);
    setAmount("");
  };

  return (
    <div className="text-sm">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-md bg-surface-950 p-1">
        {(["limit", "market"] as OrderType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cls(
              "rounded py-1.5 text-sm font-medium capitalize transition-colors",
              type === t ? "bg-surface-700 text-white" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-1 rounded-md bg-surface-950 p-1">
        {(["buy", "sell"] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cls(
              "rounded py-1.5 text-sm font-semibold transition-colors",
              s === "buy"
                ? side === "buy"
                  ? "bg-accent-green text-surface-950"
                  : "text-accent-green hover:bg-accent-green/10"
                : side === "sell"
                  ? "bg-accent-red text-white"
                  : "text-accent-red hover:bg-accent-red/10",
            )}
          >
            {s === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      {type === "limit" && (
        <div className="mb-3">
          <label className="label">Price ({quote})</label>
          <input className="input font-mono" value={limit} onChange={(e) => setLimit(e.target.value)} inputMode="decimal" />
        </div>
      )}

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <label className="label mb-0">Amount ({base})</label>
          <button className="text-xs text-brand-400 hover:underline" onClick={() => setAmount(String(maxAmount))}>
            Max
          </button>
        </div>
        <input className="input font-mono" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
      </div>

      {type === "limit" && (
        <div className="mb-3">
          <button
            onClick={() => setShowProtect((v) => !v)}
            className="text-xs font-medium text-brand-400 hover:underline"
          >
            {showProtect ? "−" : "+"} TP / SL
          </button>
          {showProtect && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="label">Take profit</label>
                <input className="input font-mono" value={tp} onChange={(e) => setTp(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <label className="label">Stop loss</label>
                <input className="input font-mono" value={sl} onChange={(e) => setSl(e.target.value)} placeholder="Optional" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mb-3 space-y-1 text-xs text-slate-500">
        <div className="flex justify-between">
          <span>Available</span>
          <span className="font-mono text-slate-300">
            {formatNum(available, side === "buy" ? 2 : 4)} {balanceLabel}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total</span>
          <span className="font-mono text-slate-300">{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>Fee (0.1%)</span>
          <span className="font-mono text-slate-300">{formatPrice(total * 0.001)}</span>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!amt}
        className={cls("w-full", side === "buy" ? "btn-green" : "btn-red")}
      >
        {side === "buy" ? `Buy ${base}` : `Sell ${base}`}
      </button>

      {placed && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-accent-green/30 bg-accent-green/10 p-2.5 text-xs text-accent-green">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Paper order placed</p>
            <p className="mt-0.5 font-mono text-accent-green/80">{placed}</p>
          </div>
        </div>
      )}
    </div>
  );
}
