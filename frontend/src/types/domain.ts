export type User = {
  id: string;
  name: string;
  email?: string;
  username?: string;
  initials: string;
  color: string;
  avatarUrl?: string;
};

export type GroupStatus = "active" | "settled";

export type Group = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: GroupStatus;
  members: User[];
  expenses: Expense[];
  settlements: Settlement[];
};

export type ExpenseSplitType = "equal" | "exact" | "percentage";

export type Expense = {
  id: string;
  groupId: string;
  title: string;
  category: string;
  categoryColor: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  paidBy?: User;
  splitType: ExpenseSplitType;
  date: string;
  receiptUrl?: string;
  originalAmount?: number;
  originalCurrency?: string;
};

export type ExpenseSplit = {
  expenseId: string;
  userId: string;
  amount: number;
  percentage?: number;
};

export type SettlementStatus = "pending" | "paid" | "cancelled";

export type Settlement = {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  from?: User;
  to?: User;
  amount: number;
  currency?: string;
  status?: SettlementStatus;
  paid?: boolean;
  paidAt?: string;
};

export type NotificationType = "expense" | "settlement" | "invite" | "reminder";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  read: boolean;
};
