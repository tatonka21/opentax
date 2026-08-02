import { memo, useMemo } from "react";
import type { Trade } from "@/lib/mock";
import { formatPrice, formatNum, formatTime } from "@/lib/format";

export const TradeFeed = memo(function TradeFeed({ trades }: { trades: Trade[] }) {
  const list = useMemo(() => [...trades].sort((a, b) => b.time - a.time).slice(0, 30), [trades]);
  return (
    <div className="text-xs font-mono">
      <div className="mb-1 flex items-center justify-between px-2 font-semibold uppercase text-slate-500">
        <span className="flex-1">Price</span>
        <span className="flex-1 text-right">Amount</span>
        <span className="flex-1 text-right">Time</span>
      </div>
      <div className="space-y-[1px]">
        {list.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-2 py-[3px]">
            <span className={`flex-1 ${t.side === "buy" ? "text-accent-green" : "text-accent-red"}`}>
              {formatPrice(t.price)}
            </span>
            <span className="flex-1 text-right text-slate-300">{formatNum(t.amount, 4)}</span>
            <span className="flex-1 text-right text-slate-500">{formatTime(t.time)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
