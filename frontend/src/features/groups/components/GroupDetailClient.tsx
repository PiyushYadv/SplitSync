"use client";

import { useState } from "react";
import { ChevronRight, Clock, TrendingUp, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import SummaryCards from "@/src/features/dashboard/components/SummaryCards";
import OCRModal from "@/src/features/dashboard/components/OCRModal";
import NewExpenseModal from "@/src/features/expenses/components/NewExpenseModal";
import GroupHeaderActions from "@/src/features/groups/components/GroupHeaderActions";
import GroupExpenseTable from "@/src/features/groups/components/GroupExpenseTable";
import InviteMembersModal from "@/src/features/groups/components/InviteMembersModal";
import LeaveGroupModal from "@/src/features/groups/components/LeaveGroupModal";
import { GROUP_COLOR_STYLES } from "@/src/features/groups/types";
import SettlementPanel from "@/src/features/settlements/components/SettlementPanel";
import { errorMessage } from "@/src/lib/api/client";
import { useLeaveGroup } from "@/src/lib/data/mutations";
import { useCurrentUser, useGroup } from "@/src/lib/data/queries";
import { formatMoney, formatSignedMoney } from "@/src/lib/format/money";
import type { GroupDetail } from "@/src/types/domain";

type Modal = "expense" | "scan" | "invite" | "leave" | null;

export default function GroupDetailClient({
  initialGroup,
}: {
  initialGroup: GroupDetail;
}) {
  const router = useRouter();
  const { data: group = initialGroup } = useGroup(initialGroup.id, initialGroup);
  const { data: currentUser } = useCurrentUser();
  const leaveGroup = useLeaveGroup();
  const [modal, setModal] = useState<Modal>(null);

  const currency = group.baseCurrency;
  const pending = group.settlements.filter((settlement) => settlement.status === "pending");
  const myPending = pending.filter(
    (s) => s.fromUserId === currentUser?.id || s.toUserId === currentUser?.id,
  );
  const cards = [
    {
      label: "Total Group Spend",
      value: formatMoney(group.totalSpend, currency),
      sub: `${group.expenses.length} expense${group.expenses.length === 1 ? "" : "s"}`,
      icon: Wallet,
      color: "text-slate-700",
      iconBg: "bg-slate-100",
      trend: `${group.members.length} member${group.members.length === 1 ? "" : "s"}`,
    },
    {
      label: "Your Net Balance",
      value: formatSignedMoney(group.balance, currency),
      sub:
        group.balance > 0 ? "You are owed" : group.balance < 0 ? "You owe" : "You're settled up",
      icon: TrendingUp,
      color: group.balance >= 0 ? "text-emerald-600" : "text-rose-500",
      iconBg: group.balance >= 0 ? "bg-emerald-50" : "bg-rose-50",
      trend: currency,
    },
    {
      label: "Pending Settlements",
      value: String(pending.length),
      sub: `${formatMoney(pending.reduce((sum, item) => sum + item.amount, 0), currency)} outstanding`,
      icon: Clock,
      color: "text-amber-600",
      iconBg: "bg-amber-50",
      trend: myPending.length ? `${myPending.length} involve you` : "Nothing for you",
    },
  ];
  const badge = GROUP_COLOR_STYLES[group.color]?.badge ?? GROUP_COLOR_STYLES.indigo.badge;

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
        <span className="text-slate-700 font-medium">
          {group.emoji} {group.name}
        </span>
        <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 capitalize ${badge}`}>
          {group.status}
        </span>
        <GroupHeaderActions
          onAddExpense={() => setModal("expense")}
          onScan={() => setModal("scan")}
          onInvite={() => setModal("invite")}
          onLeave={() => {
            leaveGroup.reset();
            setModal("leave");
          }}
        />
      </div>
      <SummaryCards cards={cards} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>
        <GroupExpenseTable expenses={group.expenses} currentUserId={currentUser?.id} />
        <SettlementPanel group={group} currentUserId={currentUser?.id} />
      </div>
      {modal === "expense" && (
        <NewExpenseModal defaultGroupId={group.id} onClose={() => setModal(null)} />
      )}
      {modal === "scan" && (
        <OCRModal defaultGroupId={group.id} onClose={() => setModal(null)} />
      )}
      {modal === "invite" && (
        <InviteMembersModal
          groupId={group.id}
          groupName={group.name}
          memberIds={group.members.map((member) => member.id)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "leave" && (
        <LeaveGroupModal
          name={group.name}
          pending={leaveGroup.isPending}
          error={leaveGroup.isError ? errorMessage(leaveGroup.error) : null}
          onClose={() => setModal(null)}
          onConfirm={() =>
            leaveGroup.mutate(group.id, {
              onSuccess: () => router.push("/groups"),
            })
          }
        />
      )}
    </div>
  );
}
