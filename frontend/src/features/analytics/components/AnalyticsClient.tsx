"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import SpendingLineChart from "@/src/features/analytics/components/SpendingLineChart";
import CategoryBreakdown from "@/src/features/analytics/components/CategoryBreakdown";
import AuditRows from "@/src/features/analytics/components/AuditRows";

const CATEGORY_DATA = [
  { name: "Accommodation", value: 480, color: "#6366f1" },
  { name: "Food & Drink", value: 130.5, color: "#f59e0b" },
  { name: "Transport", value: 200, color: "#3b82f6" },
  { name: "Activities", value: 205, color: "#10b981" },
  { name: "Wellness", value: 230, color: "#ec4899" },
];
const AUDIT_LOG = [
  {
    id: "a1",
    action: "Added expense",
    user: "You",
    target: "Surfing lessons at Kuta · $120.00",
    time: "2m ago",
    type: "add",
  },
  {
    id: "a2",
    action: "Settled up",
    user: "Diana Lim",
    target: "paid Alice Chen · $18.00",
    time: "1h ago",
    type: "settle",
  },
  {
    id: "a3",
    action: "Edited expense",
    user: "Alice Chen",
    target: "Villa at Seminyak · $480.00",
    time: "3h ago",
    type: "edit",
  },
  {
    id: "a4",
    action: "Added expense",
    user: "Bob Tanaka",
    target: "Surfing lessons at Kuta · $120.00",
    time: "5h ago",
    type: "add",
  },
];

export default function AnalyticsClient() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(
    () =>
      AUDIT_LOG.filter(
        (entry) =>
          (filter === "all" || entry.type === filter) &&
          `${entry.action} ${entry.user} ${entry.target}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [filter, search],
  );
  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <p className="text-xs text-slate-400">Insights</p>
          <h1 className="text-lg font-bold text-slate-900">Analytics</h1>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            ["Total spend", "$4,325", "All groups"],
            ["Average monthly", "$721", "Last 6 months"],
            ["Largest category", "Accommodation", "Trip to Bali"],
          ].map(([label, value, sub]) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-lg p-4"
            >
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900 mt-2">{value}</p>
              <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>
        <div
          className="grid gap-4 mb-5"
          style={{ gridTemplateColumns: "1fr 320px" }}
        >
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Monthly Spending Trends
            </h3>
            <SpendingLineChart />
          </div>
          <CategoryBreakdown data={CATEGORY_DATA} />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Audit Trail
              </h3>
              <span className="text-[11px] text-slate-400">
                {filtered.length} events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {["all", "add", "edit", "settle"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`text-[11px] px-2 py-1 rounded ${filter === item ? "bg-indigo-50 text-indigo-700" : "text-slate-500"}`}
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
          <AuditRows entries={filtered} />
        </div>
      </div>
    </div>
  );
}
