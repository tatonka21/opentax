import { NavLink, Outlet } from "react-router-dom";
import { cls } from "@/lib/format";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Coins,
  Database,
  Gift,
  Landmark,
  LayoutGrid,
  Megaphone,
  PieChart,
  Rocket,
  Settings,
  Wallet,
  Zap,
} from "lucide-react";
import { markets } from "@/lib/mock";
import { formatPrice, formatUsd } from "@/lib/format";
import type { ComponentType } from "react";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const mainNav: NavItem[] = [
  { to: "/trade/BTC/USDT", label: "Trade", icon: BarChart3 },
  { to: "/markets", label: "Markets", icon: LayoutGrid },
  { to: "/swap", label: "Swap", icon: ArrowLeftRight },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/staking", label: "Staking", icon: Landmark },
  { to: "/earn", label: "Earn", icon: Zap },
  { to: "/alerts", label: "Alerts", icon: Megaphone },
];

const moreNav: NavItem[] = [
  { to: "/launchpad", label: "Launchpad", icon: Rocket },
  { to: "/referral", label: "Referral", icon: Gift },
  { to: "/developer", label: "API", icon: Settings },
  { to: "/admin", label: "Admin", icon: Database },
];

function Ticker() {
  return (
    <div className="hidden items-center gap-5 overflow-hidden lg:flex">
      {markets.slice(0, 4).map((m) => (
        <div key={m.symbol} className="flex items-baseline gap-1.5 text-xs">
          <span className="text-slate-400">{m.base}/{m.quote}</span>
          <span className={m.change24h >= 0 ? "text-accent-green" : "text-accent-red"}>
            {formatPrice(m.price)}
          </span>
        </div>
      ))}
    </div>
  );
}

function NavLinks({ items, label }: { items: NavItem[]; label?: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {label && <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>}
      {items.map(({ to, label: l, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cls(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-600/15 text-brand-400" : "text-slate-400 hover:bg-surface-800 hover:text-slate-200",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {l}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-surface-800 bg-surface-900 md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-surface-800 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Open<span className="text-brand-400">TAX</span>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <NavLinks items={mainNav} />
          <NavLinks items={moreNav} label="More" />
        </div>
        <div className="border-t border-surface-800 p-3 text-center">
          <Coins className="mx-auto mb-1 h-4 w-4 text-accent-yellow" />
          <p className="text-[10px] text-slate-600">Paper trading sandbox</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-surface-800 bg-surface-900 px-4">
          <div className="md:hidden">
            <span className="text-lg font-bold text-white">
              Open<span className="text-brand-400">TAX</span>
            </span>
          </div>
          <Ticker />
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-md border border-surface-700 px-2 py-1 text-xs text-slate-400 sm:block">
              {formatUsd(156773.5, 0)} est. balance
            </span>
            <button className="btn-ghost hidden h-8 w-8 items-center justify-center rounded-full sm:inline-flex">
              <Settings className="h-4 w-4" />
            </button>
            <button className="btn-outline px-2 py-1.5 text-xs">Sign in</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface-950 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
