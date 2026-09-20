export type ExpenseValidationInput = {
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
};

export function validateExpense(input: ExpenseValidationInput) {
  if (!input.groupId) return "A group is required";
  if (!input.title.trim()) return "A description is required";
  if (!Number.isFinite(input.amount) || input.amount <= 0)
    return "Amount must be greater than zero";
  if (!input.currency) return "Currency is required";
  if (!input.paidByUserId) return "A payer is required";
  return null;
}
