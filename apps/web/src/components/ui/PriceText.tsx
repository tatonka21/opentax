import { cls } from "@/lib/format";

export function PriceText({ value, digits = 2, className }: { value: number; digits?: number; className?: string }) {
  const up = value >= 0;
  return (
    <span className={cls(up ? "text-accent-green" : "text-accent-red", className)}>
      {up ? "+" : ""}
      {value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}
    </span>
  );
}
