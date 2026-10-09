"use client";

import { useMemo, useState } from "react";
import { Camera, Clock, TrendingUp, Wallet } from "lucide-react";
import { useAppContext } from "@/src/context/AppContext";
import SummaryCards from "@/src/features/dashboard/components/SummaryCards";
import TransactionTable from "@/src/features/dashboard/components/TransactionTable";
import SettlementSidebar from "@/src/features/dashboard/components/SettlementSidebar";
import OCRModal from "@/src/features/dashboard/components/OCRModal";
import { useCurrentUser, useDashboard } from "@/src/lib/data/queries";
import { formatMoney, formatSignedMoney } from "@/src/lib/format/money";
import type { DashboardData } from "@/src/types/domain";

export default function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const [showOCR, setShowOCR] = useState(false);
  const { searchQuery } = useAppContext();
  const { data = initialData } = useDashboard(initialData);
  const { data: currentUser } = useCurrentUser();
  const { summary, groups, expenses, settlements } = data;

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? expenses.filter(
          (expense) =>
            expense.title.toLowerCase().includes(query) ||
            expense.category.toLowerCase().includes(query),
        )
      : expenses;
  }, [expenses, searchQuery]);

  // Summary totals are converted to your preferred currency on the server.
  const cards = [
    {
      label: "Total Spend (All Groups)",
      value: formatMoney(summary.totalSpend, summary.currency),
      sub: `Across ${groups.length} group${groups.length === 1 ? "" : "s"}`,
      icon: Wallet,
      color: "text-slate-700",
      iconBg: "bg-slate-100",
      trend: summary.currency,
    },
    {
      label: "Your Net Balance",
      value: formatSignedMoney(summary.netBalance, summary.currency),
      sub: `Owed ${formatMoney(summary.youAreOwed, summary.currency)} · you owe ${formatMoney(summary.youOwe, summary.currency)}`,
      icon: TrendingUp,
      color: summary.netBalance >= 0 ? "text-emerald-600" : "text-rose-500",
      iconBg: summary.netBalance >= 0 ? "bg-emerald-50" : "bg-rose-50",
      trend: "All groups",
    },
    {
      label: "Pending Settlements",
      value: String(summary.pendingSettlements),
      sub: "Payments involving you",
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: summary.pendingSettlements ? "Settle up" : "All clear",
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
        <span className="text-slate-700 font-medium">Overview</span>
        <span className="ml-2 bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-indigo-200">
          All Groups
        </span>
        <button
          onClick={() => setShowOCR(true)}
          className="ml-auto flex items-center gap-1.5 text-xs text-indigo-600 font-semibold border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-md"
        >
          <Camera size={13} /> Scan Receipt
        </button>
      </div>
      <SummaryCards cards={cards} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
        <TransactionTable
          title="Recent Transactions"
          expenses={filteredExpenses}
          groups={groups}
          currentUserId={currentUser?.id}
          emptyMessage={
            searchQuery.trim()
              ? `No recent expenses match "${searchQuery.trim()}"`
              : "No expenses yet. Add one with “New Expense”."
          }
        />
        <SettlementSidebar
          settlements={settlements}
          groups={groups}
          currentUserId={currentUser?.id}
        />
      </div>
      {showOCR && <OCRModal onClose={() => setShowOCR(false)} />}
    </div>
  );
}
