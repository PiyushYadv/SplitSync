/**
 * Domain types mirroring the backend API (see openapi.yaml at the repo root).
 * Money values are numbers with two decimals; the server does all ledger math.
 * Optional fields are omitted by the API when they have no value.
 */

export type ListResponse<T> = {
  data: T[];
  total: number;
  nextCursor?: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
};

/** Public view of a user; `email` is only present for yourself. */
export type UserSummary = {
  id: string;
  name: string;
  email?: string;
  username?: string;
  initials: string;
  color: string;
  avatarUrl?: string;
};

export type GroupColor = "emerald" | "indigo" | "amber" | "rose" | "violet" | "sky";
export type GroupStatus = "active" | "settled" | "archived";
export type MemberRole = "owner" | "admin" | "member";

export type GroupSummary = {
  id: string;
  name: string;
  emoji: string;
  color: GroupColor;
  baseCurrency: string;
  memberCount: number;
  totalSpend: number;
  /** Your net position in the group's base currency; positive means you are owed. */
  balance: number;
  status: GroupStatus;
  lastActivity: string;
};

export type GroupMember = UserSummary & {
  role: MemberRole;
  balance: number;
};

export type GroupDetail = {
  id: string;
  name: string;
  emoji: string;
  color: GroupColor;
  baseCurrency: string;
  status: GroupStatus;
  members: GroupMember[];
  expenses: Expense[];
  settlements: Settlement[];
  totalSpend: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type SplitType = "equal" | "exact" | "percentage";

export type ExpenseSplit = {
  userId: string;
  /** Share in the group's base currency. */
  amount: number;
  percentage?: number;
};

export type Expense = {
  id: string;
  groupId: string;
  title: string;
  category: string;
  categoryColor: string;
  /** In the group's base currency (`currency`). */
  amount: number;
  currency: string;
  /** As entered. */
  originalAmount: number;
  originalCurrency: string;
  exchangeRate: number;
  paidByUserId: string;
  paidBy: UserSummary;
  splitType: SplitType;
  splits: ExpenseSplit[];
  date: string;
  receiptUrl?: string;
  createdAt: string;
};

export type SettlementStatus = "pending" | "paid" | "cancelled";

export type Settlement = {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  from: UserSummary;
  to: UserSummary;
  amount: number;
  currency: string;
  status: SettlementStatus;
  paid: boolean;
  paidAt?: string;
  createdAt: string;
};

export type InvitationStatus = "pending" | "accepted" | "declined";

export type Invitation = {
  id: string;
  groupId: string;
  groupName: string;
  emoji: string;
  invitedBy: UserSummary;
  invitedUser: UserSummary;
  memberCount: number;
  preview?: string;
  status: InvitationStatus;
  createdAt: string;
};

export type Friend = {
  id: string;
  name: string;
  username?: string;
  initials: string;
  color: string;
  avatarUrl?: string;
  sharedGroupCount: number;
};

export type UserSearchResult = {
  id: string;
  name: string;
  username?: string;
  initials: string;
  color: string;
  avatarUrl?: string;
  /** Friends you have in common. */
  mutualCount: number;
  /** You already share a group. */
  friend: boolean;
};

export type NotificationType = "expense" | "settlement" | "invite" | "reminder";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  desc?: string;
  time: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type NotificationList = {
  data: Notification[];
  unreadCount: number;
};

export type ThemePreference = "system" | "light" | "dark";
export type NotificationPreferences = {
  expense: boolean;
  settlement: boolean;
  reminder: boolean;
  digest: boolean;
};

export type Settings = {
  profile: {
    name: string;
    email: string;
    username?: string;
    avatarUrl?: string;
  };
  notifications: NotificationPreferences;
  currency: string;
  theme: ThemePreference;
  language: string;
  dateFormat: string;
};

export type DashboardData = {
  /** Converted to `currency`, your preferred currency. */
  summary: {
    totalSpend: number;
    youOwe: number;
    youAreOwed: number;
    netBalance: number;
    pendingSettlements: number;
    currency: string;
  };
  groups: GroupSummary[];
  /** The 10 most recent expenses across your groups. */
  expenses: Expense[];
  /** Pending settlements where you pay or receive. */
  settlements: Settlement[];
};

export type AuditType = "add" | "settle" | "invite" | "join" | "leave" | "group";

export type AuditEntry = {
  id: string;
  action: string;
  label: string;
  type: AuditType;
  actor?: UserSummary;
  groupId?: string;
  groupName?: string;
  target?: string;
  createdAt: string;
};

export type CategoryAmount = {
  name: string;
  amount: number;
  color: string;
};

export type Analytics = {
  currency: string;
  from: string;
  to: string;
  totalSpend: number;
  yourShare: number;
  averageMonthlySpend: number;
  largestCategory?: CategoryAmount;
  monthlySpend: Array<{ month: string; amount: number }>;
  categories: CategoryAmount[];
  audit: AuditEntry[];
};
