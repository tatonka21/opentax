import { cls } from "@/lib/format";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={cls("card p-4", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h3 className="text-sm font-semibold text-slate-200">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
