import type { ReactNode } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import type { ComponentType } from "react";

export function Placeholder({
  icon: Icon,
  title,
  body,
  items,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  items: string[];
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-brand-400" />
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <Badge tone="blue">In development</Badge>
      </div>
      <Card>
        <p className="text-sm text-slate-400">{body}</p>
        <ul className="mt-4 space-y-2">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2 text-sm text-slate-500">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              {it}
            </li>
          ))}
        </ul>
        {action && <div className="mt-5">{action}</div>}
      </Card>
    </div>
  );
}
