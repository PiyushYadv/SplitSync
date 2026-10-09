"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import SpendingLineChart from "@/src/features/analytics/components/SpendingLineChart";
import CategoryBreakdown from "@/src/features/analytics/components/CategoryBreakdown";
import AuditRows from "@/src/features/analytics/components/AuditRows";
import { errorMessage } from "@/src/lib/api/client";
import { useAnalytics, useCurrentUser, useGroups } from "@/src/lib/data/queries";
import { formatMonth } from "@/src/lib/format/date";
import { formatMoney } from "@/src/lib/format/money";
import type { Analytics, AuditType, GroupSummary } from "@/src/types/domain";

const AUDIT_FILTERS: Array<"all" | AuditType> = ["all", "add", "settle", "invite", "join", "leave"];

export default function AnalyticsClient({
  initialData,
  initialGroups,
}: {
  initialData: Analytics;
  initialGroups: GroupSummary[];
}) {
  const [groupId, setGroupId] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | AuditType>("all");
  const { data: groups = initialGroups } = useGroups(initialGroups);
  const { data: currentUser } = useCurrentUser();
  // The server-rendered data is the unfiltered view; other views load on demand.
  const analyticsQuery = useAnalytics(
    groupId ? { groupId } : {},
    groupId ? undefined : initialData,
  );
  const analytics = analyticsQuery.data ?? initialData;
  const { currency } = analytics;
  const scope = groupId ? groups.find((g) => g.id === groupId)?.name ?? "This group" : "All groups";
  const period = analytics.monthlySpend.length
    ? `${formatMonth(analytics.monthlySpend[0].month, true)} – ${formatMonth(analytics.monthlySpend.at(-1)!.month, true)}`
    : "";

  const filtered = useMemo(
    () =>
      analytics.audit.filter(
        (entry) =>
          (filter === "all" || entry.type === filter) &&
          `${entry.label} ${entry.actor?.name ?? ""} ${entry.target ?? ""} ${entry.groupName ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [analytics.audit, filter, search],
  );

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400">Insights</p>
            <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
          </div>
          <select
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-700"
          >
            <option value="">All groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.emoji} {group.name}
              </option>
            ))}
          </select>
        </div>
        {analyticsQuery.isError && (
          <p className="mb-4 text-sm text-rose-600">{errorMessage(analyticsQuery.error)}</p>
        )}
        <div
          className={`grid grid-cols-4 gap-4 mb-5 transition-opacity ${analyticsQuery.isPlaceholderData ? "opacity-60" : ""}`}
        >
          {[
            ["Total spend", formatMoney(analytics.totalSpend, currency), scope],
            ["Your share", formatMoney(analytics.yourShare, currency), "What you consumed"],
            ["Average monthly", formatMoney(analytics.averageMonthlySpend, currency), period],
            [
              "Largest category",
              analytics.largestCategory?.name ?? "—",
              analytics.largestCategory
                ? formatMoney(analytics.largestCategory.amount, currency)
                : "No spending yet",
            ],
          ].map(([label, value, sub]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900 mt-2 truncate">{value}</p>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{sub}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "1fr 320px" }}>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Monthly Spending</h3>
              <span className="text-[11px] text-slate-400">{currency}</span>
            </div>
            <SpendingLineChart data={analytics.monthlySpend} currency={currency} />
          </div>
          <CategoryBreakdown
            data={analytics.categories}
            currency={currency}
            subtitle={`${scope} · ${period}`}
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Audit Trail</h3>
              <span className="text-[11px] text-slate-400">
                {filtered.length} recent event{filtered.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {AUDIT_FILTERS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`text-[11px] px-2 py-1 rounded capitalize ${filter === item ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search log"
                  className="bg-slate-50 border border-slate-200 rounded-md pl-7 pr-3 py-1.5 text-xs w-36"
                />
              </div>
            </div>
          </div>
          <AuditRows entries={filtered} currentUserId={currentUser?.id} />
        </div>
      </div>
    </div>
  );
}
