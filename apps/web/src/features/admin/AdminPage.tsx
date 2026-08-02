import { useState } from "react";
import { users, deposits } from "./admin-data";
import { formatUsd, formatDate, cls } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert } from "lucide-react";

const tabs = ["Overview", "Users", "Deposits", "Withdrawals", "KYC", "Risk"] as const;

export default function AdminPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <ShieldAlert className="h-5 w-5 text-accent-yellow" />
        <h1 className="text-xl font-bold text-white">Backoffice</h1>
        <Badge tone="yellow">Operator</Badge>
      </div>

      <div className="flex flex-wrap gap-1 rounded-md bg-surface-900 p-1 sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cls(
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "bg-surface-700 text-white" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Registered users", "128,431", "+312 today"],
            ["24h volume", "$1.2B", "+4.1%"],
            ["Pending KYC", "143", "needs review"],
            ["Risk alerts", "27", "AML queue"],
          ].map(([label, value, sub]) => (
            <Card key={label}>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-600">{sub}</p>
            </Card>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-surface-900">
                <tr className="text-xs uppercase text-slate-500">
                  <th className="table-head px-4 py-2">User</th>
                  <th className="table-head px-4 py-2">KYC</th>
                  <th className="table-head px-4 py-2 text-right">Balance</th>
                  <th className="table-head px-4 py-2">Joined</th>
                  <th className="table-head px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-850">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-slate-200">{u.email}</p>
                      <p className="text-xs text-slate-600">UID {u.id}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={u.kyc === "Verified" ? "green" : u.kyc === "Pending" ? "yellow" : "neutral"}>{u.kyc}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-300">{formatUsd(u.balance, 0)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(u.joined)}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={u.status === "Active" ? "green" : "red"}>{u.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "Deposits" && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-surface-900">
                <tr className="text-xs uppercase text-slate-500">
                  <th className="table-head px-4 py-2">User</th>
                  <th className="table-head px-4 py-2">Asset</th>
                  <th className="table-head px-4 py-2 text-right">Amount</th>
                  <th className="table-head px-4 py-2 text-right">USD</th>
                  <th className="table-head px-4 py-2">Time</th>
                  <th className="table-head px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-850">
                    <td className="px-4 py-2.5 text-slate-300">{d.user}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-200">{d.asset}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-300">{d.amount}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-400">{formatUsd(d.usd, 0)}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">{formatDate(d.time)}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={d.status === "Confirmed" ? "green" : d.status === "Pending" ? "yellow" : "red"}>{d.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {["Withdrawals", "KYC", "Risk"].includes(tab) && (
        <Card>
          <p className="text-sm text-slate-400">
            The <span className="text-slate-200">{tab.toLowerCase()}</span> module wires into the OpenDAX
            Tower admin panel and the compliance engine. Scaffolded here for the full-suite map.
          </p>
        </Card>
      )}
    </div>
  );
}
