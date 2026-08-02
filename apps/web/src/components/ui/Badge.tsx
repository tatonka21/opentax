import { cls } from "@/lib/format";
import type { ReactNode } from "react";

type Tone = "green" | "red" | "blue" | "yellow" | "neutral";

const tones: Record<Tone, string> = {
  green: "bg-accent-green/10 text-accent-green",
  red: "bg-accent-red/10 text-accent-red",
  blue: "bg-brand-500/10 text-brand-400",
  yellow: "bg-accent-yellow/10 text-accent-yellow",
  neutral: "bg-surface-700 text-slate-300",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cls("inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
