import type { Expense, Group, Settlement } from "@/src/data/groupData";

export function getDashboardSummary(
  groups: Group[],
  expenses: Expense[],
  settlements: Settlement[],
  memberId = "me",
) {
  const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const myPaid = expenses
    .filter((expense) => expense.paidBy.id === memberId)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const myShare = groups.reduce(
    (sum, group) =>
      sum +
      group.expenses.reduce(
        (groupSum, expense) => groupSum + expense.amount / group.members.length,
        0,
      ),
    0,
  );

  return {
    totalSpend,
    myPaid,
    myShare,
    netBalance: Number((myPaid - myShare).toFixed(2)),
    pendingSettlements: settlements.filter((settlement) => !settlement.paid),
  };
}
