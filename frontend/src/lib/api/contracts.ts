import type { Expense, Group, Settlement } from "@/src/data/groupData";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
};

export type SessionResponse = {
  authenticated: boolean;
  user?: ApiUser;
  expiresAt?: string;
};

export type LoginResponse = {
  user: ApiUser;
  expiresAt?: string;
};

export type SignupResponse = {
  userId: string;
  verificationRequired: boolean;
};

export type DashboardResponse = {
  groups: Group[];
  expenses: Expense[];
  settlements: Settlement[];
};

export type ApiErrorResponse = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
};

export type ApiListResponse<T> = {
  data: T[];
  total?: number;
  nextCursor?: string;
};
