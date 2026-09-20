import type { Expense, Group, Settlement } from "@/src/data/groupData";
import type { GroupListItem } from "@/src/features/groups/types";

type BackendGroup = Partial<Group> & {
  memberCount?: number;
  membersCount?: number;
  totalSpend?: number;
  balance?: number;
  yourBalance?: number;
};

export function mapGroupListItem(group: BackendGroup): GroupListItem {
  return {
    id: group.id ?? "unknown",
    name: group.name ?? "Unnamed group",
    emoji: group.emoji ?? "🌍",
    color: (group.color ?? "indigo") as GroupListItem["color"],
    memberCount:
      group.memberCount ?? group.membersCount ?? group.members?.length ?? 0,
    totalSpend:
      group.totalSpend ??
      group.expenses?.reduce((sum, expense) => sum + expense.amount, 0) ??
      0,
    balance: group.balance ?? group.yourBalance ?? 0,
    status: group.status ?? "active",
    lastActivity: "Recently",
  };
}

export function mapGroupList(groups: BackendGroup[]) {
  return groups.map(mapGroupListItem);
}

export function mapDashboardResponse(response: {
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
}) {
  return {
    groups: response.groups,
    expenses: response.expenses.map(mapExpense),
    settlements: response.settlements.map(mapSettlement),
  };
}

export function mapExpense(expense: Partial<Expense>): Expense {
  const raw = expense as Partial<Expense> & {
    paidByUserId?: string;
    receiptUrl?: string;
  };
  const paidBy = expense.paidBy ?? {
    id: raw.paidByUserId ?? "unknown",
    name: "Unknown",
    initials: "?",
    color: "#94a3b8",
  };
  return {
    id: expense.id ?? "unknown",
    groupId: expense.groupId ?? "unknown",
    title: expense.title ?? "Untitled expense",
    category: expense.category ?? "Other",
    categoryColor: expense.categoryColor ?? "#94a3b8",
    amount: expense.amount ?? 0,
    currency: expense.currency ?? "USD",
    paidBy,
    splitType: expense.splitType ?? "Equal",
    date: expense.date ?? "",
    originalAmount: expense.originalAmount,
    originalCurrency: expense.originalCurrency,
  };
}

export function mapSettlement(settlement: Partial<Settlement>): Settlement {
  const raw = settlement as Partial<Settlement> & {
    fromUserId?: string;
    toUserId?: string;
    currency?: string;
    status?: string;
    paidAt?: string;
  };
  const from = settlement.from ?? {
    id: raw.fromUserId ?? "unknown",
    name: "Unknown",
    initials: "?",
    color: "#94a3b8",
  };
  const to = settlement.to ?? {
    id: raw.toUserId ?? "unknown",
    name: "Unknown",
    initials: "?",
    color: "#94a3b8",
  };
  return {
    id: settlement.id ?? "unknown",
    groupId: settlement.groupId ?? "unknown",
    from,
    to,
    amount: settlement.amount ?? 0,
    paid: settlement.paid ?? false,
  };
}
