export type CreateExpenseInput = {
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  category: string;
};

export type CreateGroupInput = {
  name: string;
  emoji: string;
  color: string;
  memberIds: string[];
};

/** Placeholder mutation seams for the future backend/API layer. */
export async function createExpense(_input: CreateExpenseInput) {
  return apiRequest("/expenses", {
    method: "POST",
    body: JSON.stringify(_input),
  });
}

export async function createGroup(_input: CreateGroupInput) {
  return apiRequest("/groups", {
    method: "POST",
    body: JSON.stringify(_input),
  });
}
import { apiRequest } from "@/src/lib/api/client";
