export type ExpenseFilters = {
  groupId?: string;
  category?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export type AnalyticsFilters = {
  groupId?: string;
  from?: string;
  to?: string;
  currency?: string;
};

export const queryKeys = {
  config: ["config"] as const,
  currentUser: ["currentUser"] as const,
  dashboard: ["dashboard"] as const,
  groups: ["groups"] as const,
  group: (id: string) => ["groups", id] as const,
  expenses: (filters: ExpenseFilters = {}) => ["expenses", filters] as const,
  allExpenses: ["expenses"] as const,
  settlements: ["settlements"] as const,
  notifications: ["notifications"] as const,
  invitations: ["invitations"] as const,
  friends: ["friends"] as const,
  userSearch: (query: string) => ["users", "search", query] as const,
  settings: ["settings"] as const,
  analytics: (filters: AnalyticsFilters = {}) => ["analytics", filters] as const,
  allAnalytics: ["analytics"] as const,
};
