"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import {
  queryKeys,
  type AnalyticsFilters,
  type ExpenseFilters,
} from "@/src/lib/query/keys";
import type {
  Analytics,
  ClientConfig,
  CurrentUser,
  DashboardData,
  Expense,
  Friend,
  GroupDetail,
  GroupSummary,
  Invitation,
  ListResponse,
  NotificationList,
  Settings,
  UserSearchResult,
} from "@/src/types/domain";

/*
 * Server Components fetch the first render's data (with the session cookie) and
 * pass it in as `initialData`; after that, these hooks keep it fresh in the browser
 * and mutations invalidate them (see mutations.ts).
 */

/** Which optional features (OAuth providers, receipt scanning) the server has configured. */
export function useClientConfig(initialData?: ClientConfig) {
  return useQuery({
    queryKey: queryKeys.config,
    queryFn: () => apiGet<ClientConfig>(API_ENDPOINTS.config),
    initialData,
    staleTime: Infinity,
  });
}

export function useCurrentUser(initialData?: CurrentUser) {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiGet<CurrentUser>(API_ENDPOINTS.auth.currentUser),
    initialData,
    staleTime: 5 * 60_000,
  });
}

export function useDashboard(initialData?: DashboardData) {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => apiGet<DashboardData>(API_ENDPOINTS.dashboard),
    initialData,
  });
}

export function useGroups(initialData?: GroupSummary[]) {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: async () =>
      (await apiGet<ListResponse<GroupSummary>>(API_ENDPOINTS.groups)).data,
    initialData,
  });
}

export function useGroup(id: string | undefined, initialData?: GroupDetail) {
  return useQuery({
    queryKey: queryKeys.group(id ?? ""),
    queryFn: () => apiGet<GroupDetail>(API_ENDPOINTS.group(id!)),
    enabled: Boolean(id),
    initialData,
  });
}

export function useExpenses(filters: ExpenseFilters = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.expenses(filters),
    queryFn: () =>
      apiGet<ListResponse<Expense>>(API_ENDPOINTS.expenses, filters),
    enabled,
  });
}

export function useInvitations(initialData?: Invitation[]) {
  return useQuery({
    queryKey: queryKeys.invitations,
    queryFn: async () =>
      (await apiGet<ListResponse<Invitation>>(API_ENDPOINTS.invitations, {
        status: "pending",
      })).data,
    initialData,
  });
}

export function useFriends(enabled = true) {
  return useQuery({
    queryKey: queryKeys.friends,
    queryFn: async () =>
      (await apiGet<ListResponse<Friend>>(API_ENDPOINTS.friends)).data,
    enabled,
  });
}

/** Pass an already-debounced query; searches need at least 2 characters. */
export function useUserSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: queryKeys.userSearch(trimmed.toLowerCase()),
    queryFn: async () =>
      (await apiGet<ListResponse<UserSearchResult>>(API_ENDPOINTS.userSearch, {
        q: trimmed,
      })).data,
    enabled: trimmed.replace(/^@/, "").length >= 2,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => apiGet<NotificationList>(API_ENDPOINTS.notifications),
    refetchInterval: 60_000,
  });
}

export function useSettings(initialData?: Settings) {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => apiGet<Settings>(API_ENDPOINTS.settings),
    initialData,
  });
}

export function useAnalytics(
  filters: AnalyticsFilters = {},
  initialData?: Analytics,
) {
  return useQuery({
    queryKey: queryKeys.analytics(filters),
    queryFn: () =>
      apiGet<Analytics>(API_ENDPOINTS.analytics, filters),
    initialData,
    placeholderData: keepPreviousData,
  });
}
