"use client";

import { useMemo, useState } from "react";
import { Camera, Clock, TrendingUp, Wallet } from "lucide-react";
import type { Expense, Group, Settlement } from "@/src/data/groupData";
import { useAppContext } from "@/src/context/AppContext";
import { getDashboardSummary } from "@/src/features/dashboard/summary";
import SummaryCards from "@/src/features/dashboard/components/SummaryCards";
import TransactionTable from "@/src/features/dashboard/components/TransactionTable";
import SettlementSidebar from "@/src/features/dashboard/components/SettlementSidebar";
import OCRModal from "@/src/features/dashboard/components/OCRModal";

export default function DashboardClient({
  groups,
  expenses,
  settlements,
}: {
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
}) {
  const [showOCR, setShowOCR] = useState(false);
  const { searchQuery, currencyMeta } = useAppContext();
  const summary = getDashboardSummary(groups, expenses, settlements);
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
  const format = (value: number) =>
    currencyMeta.symbol === "Rp"
      ? `Rp ${Math.round(value * currencyMeta.rate).toLocaleString("id-ID")}`
      : `${currencyMeta.symbol}${(value * currencyMeta.rate).toFixed(2)}`;
  const cards = [
    {
      label: "Total Spend (All Groups)",
      value: format(summary.totalSpend),
      sub: `Across ${groups.length} groups`,
      icon: Wallet,
      color: "text-slate-700",
      iconBg: "bg-slate-100",
      trend: `${expenses.length} expenses`,
    },
    {
      label: "Your Net Balance",
      value: `${summary.netBalance >= 0 ? "+" : "−"}${format(Math.abs(summary.netBalance))}`,
      sub: summary.netBalance >= 0 ? "You are owed overall" : "You owe overall",
      icon: TrendingUp,
      color: summary.netBalance >= 0 ? "text-emerald-600" : "text-rose-500",
      iconBg: summary.netBalance >= 0 ? "bg-emerald-50" : "bg-rose-50",
      trend: "All groups",
    },
    {
      label: "Pending Settlements",
      value: String(summary.pendingSettlements.length),
      sub: `${format(summary.pendingSettlements.reduce((total, item) => total + item.amount, 0))} outstanding`,
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: "Settle up",
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
          expenses={filteredExpenses.length ? filteredExpenses : expenses}
          showGroup
          currencyMeta={currencyMeta}
        />
        <SettlementSidebar
          settlements={settlements}
          netBalance={summary.netBalance}
          balanceRows={[]}
        />
      </div>
      {showOCR && <OCRModal onClose={() => setShowOCR(false)} />}
    </div>
  );
}
