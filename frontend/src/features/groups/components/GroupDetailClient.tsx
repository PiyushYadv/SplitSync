"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Clock, TrendingUp, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Group } from "@/src/data/groupData";
import SummaryCards from "@/src/features/dashboard/components/SummaryCards";
import GroupHeaderActions from "@/src/features/groups/components/GroupHeaderActions";
import GroupExpenseTable from "@/src/features/groups/components/GroupExpenseTable";
import SettlementPanel from "@/src/features/settlements/components/SettlementPanel";
import ReceiptScanModal from "@/src/features/expenses/components/ReceiptScanModal";
import LeaveGroupModal from "@/src/features/groups/components/LeaveGroupModal";

export default function GroupDetailClient({ group }: { group: Group }) {
  const router = useRouter();
  const [showOCR, setShowOCR] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const totalSpend = useMemo(
    () => group.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [group.expenses],
  );
  const myPaid = group.expenses
    .filter((expense) => expense.paidBy.id === "me")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const myShare = group.expenses.reduce(
    (sum, expense) => sum + expense.amount / group.members.length,
    0,
  );
  const netBalance = Number((myPaid - myShare).toFixed(2));
  const pending = group.settlements.filter((settlement) => !settlement.paid);
  const cards = [
    {
      label: "Total Group Spend",
      value: `$${totalSpend.toFixed(2)}`,
      sub: group.name,
      icon: Wallet,
      color: "text-slate-700",
      iconBg: "bg-slate-100",
      trend: `${group.members.length} members`,
    },
    {
      label: "Your Net Balance",
      value: `${netBalance >= 0 ? "+" : "−"}$${Math.abs(netBalance).toFixed(2)}`,
      sub: netBalance >= 0 ? "You are owed" : "You owe",
      icon: TrendingUp,
      color: netBalance >= 0 ? "text-emerald-600" : "text-rose-500",
      iconBg: netBalance >= 0 ? "bg-emerald-50" : "bg-rose-50",
      trend: netBalance === 0 ? "All settled" : "Pending",
    },
    {
      label: "Pending Settlements",
      value: String(pending.length),
      sub: `$${pending.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} outstanding`,
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: pending.length ? "Settle up" : "Nothing owed",
    },
  ];
  return (
    <div className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-5">
        <button
          onClick={() => router.push("/groups")}
          className="hover:text-slate-600"
        >
          Groups
        </button>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-medium">{group.name}</span>
        <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200">
          {group.status}
        </span>
        <GroupHeaderActions
          onScan={() => setShowOCR(true)}
          onLeave={() => setShowLeave(true)}
        />
      </div>
      <SummaryCards cards={cards} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
        <GroupExpenseTable expenses={group.expenses} />
        <SettlementPanel group={group} />
      </div>
      {showOCR && (
        <ReceiptScanModal
          members={group.members}
          onClose={() => setShowOCR(false)}
        />
      )}
      {showLeave && (
        <LeaveGroupModal
          name={group.name}
          onClose={() => setShowLeave(false)}
          onConfirm={() => router.push("/groups")}
        />
      )}
    </div>
  );
}
