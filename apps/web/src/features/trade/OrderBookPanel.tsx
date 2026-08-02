import { memo } from "react";
import { orderBook, type OrderBook as Book } from "@/lib/mock";
import { formatPrice, formatNum } from "@/lib/format";

type Level = { price: number; amount: number; total: number };

function Row({ lvl, max, side }: { lvl: Level; max: number; side: "buy" | "sell" }) {
  const pct = (lvl.total / max) * 100;
  return (
    <div className="relative flex items-center justify-between px-2 py-[3px] text-xs font-mono">
      <div
        className={`absolute inset-y-0 right-0 ${side === "buy" ? "bg-accent-green/10" : "bg-accent-red/10"}`}
        style={{ width: `${pct}%` }}
      />
      <span className={`relative ${side === "buy" ? "text-accent-green" : "text-accent-red"}`}>
        {formatPrice(lvl.price)}
      </span>
      <span className="relative text-slate-300">{formatNum(lvl.amount, 4)}</span>
      <span className="relative text-slate-500">{formatNum(lvl.total, 3)}</span>
    </div>
  );
}

export const OrderBookPanel = memo(function OrderBookPanel({ symbol }: { symbol: string }) {
  const book: Book = orderBook(symbol);
  const accumulate = (levels: Book["bids"]): Level[] => {
    let acc = 0;
    return levels.map((l) => {
      acc += l.amount;
      return { ...l, total: acc };
    });
  };
  const asks = accumulate(book.asks);
  const bids = accumulate(book.bids);
  const max = Math.max(asks[asks.length - 1].total, bids[bids.length - 1].total);
  const spread = asks[0].price - bids[0].price;
  const mid = (asks[0].price + bids[0].price) / 2;

  return (
    <div className="text-sm">
      <div className="mb-1 flex items-center justify-between px-2 text-xs font-semibold uppercase text-slate-500">
        <span className="flex-1">Price</span>
        <span className="flex-1 text-right">Amount</span>
        <span className="flex-1 text-right">Total</span>
      </div>
      <div className="space-y-0">
        {[...asks].reverse().map((l) => (
          <Row key={`a-${l.price}`} lvl={l} max={max} side="sell" />
        ))}
      </div>
      <div className="my-1 flex items-center justify-between border-y border-surface-800 bg-surface-900 px-2 py-1.5 text-xs font-mono">
        <span className="text-slate-400">{formatPrice(mid)}</span>
        <span className="text-slate-500">spread {formatPrice(spread)}</span>
      </div>
      <div className="space-y-0">
        {bids.map((l) => (
          <Row key={`b-${l.price}`} lvl={l} max={max} side="buy" />
        ))}
      </div>
    </div>
  );
});
