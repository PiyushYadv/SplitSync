"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSend } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import { queryKeys } from "@/src/lib/query/keys";
import type {
  CurrentUser,
  Expense,
  GroupDetail,
  Invitation,
  ListResponse,
  NotificationList,
  Settings,
  SplitType,
} from "@/src/types/domain";

export type LoginInput = { email: string; password: string };
export type SignupInput = { name: string; email: string; password: string };

export type CreateExpenseInput = {
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidByUserId: string;
  category: string;
  splitType: SplitType;
  splits?: Array<{ userId: string; amount?: number; percentage?: number }>;
  occurredAt?: string;
};

export type CreateGroupInput = {
  name: string;
  emoji: string;
  color: string;
  baseCurrency?: string;
  memberIds: string[];
};

export type SettingsSection =
  | "profile"
  | "notifications"
  | "currency"
  | "appearance"
  | "security";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiSend<{ user: CurrentUser; expiresAt: string }>(
        "POST",
        API_ENDPOINTS.auth.login,
        input,
      ),
    onSuccess: ({ user }) => {
      // Never show the previous account's cached data to a new session.
      queryClient.clear();
      queryClient.setQueryData(queryKeys.currentUser, user);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (input: SignupInput) =>
      apiSend<{ userId: string; verificationRequired: boolean }>(
        "POST",
        API_ENDPOINTS.auth.signup,
        input,
      ),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiSend("POST", API_ENDPOINTS.auth.logout),
    onSettled: () => queryClient.clear(),
  });
}

/**
 * `idempotencyKey` should be generated once per form, so a retried submit after a
 * network error can't create the expense twice.
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      idempotencyKey,
    }: {
      input: CreateExpenseInput;
      idempotencyKey: string;
    }) =>
      apiSend<Expense>("POST", API_ENDPOINTS.expenses, input, {
        "Idempotency-Key": idempotencyKey,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups }); // also the group detail
      void queryClient.invalidateQueries({ queryKey: queryKeys.allExpenses });
      void queryClient.invalidateQueries({ queryKey: queryKeys.settlements });
      void queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGroupInput) =>
      apiSend<GroupDetail>("POST", API_ENDPOINTS.groups, input),
    onSuccess: (group) => {
      queryClient.setQueryData(queryKeys.group(group.id), group);
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups, exact: true });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useInviteMembers(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) =>
      apiSend<ListResponse<Invitation>>(
        "POST",
        API_ENDPOINTS.groupInvitations(groupId),
        { userIds },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
    },
  });
}

export function useLeaveGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) =>
      apiSend("POST", API_ENDPOINTS.groupLeave(groupId)),
    onSuccess: (_, groupId) => {
      queryClient.removeQueries({ queryKey: queryKeys.group(groupId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.allExpenses });
      void queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
      void queryClient.invalidateQueries({ queryKey: queryKeys.friends });
    },
  });
}

function useInvitationResponse(
  endpoint: (invitationId: string) => string,
  joined: boolean,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) =>
      apiSend<Invitation>("POST", endpoint(invitationId)),
    onSuccess: (invitation) => {
      queryClient.setQueryData<Invitation[]>(queryKeys.invitations, (current) =>
        current?.filter((item) => item.id !== invitation.id),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.invitations });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      if (joined) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
        void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        void queryClient.invalidateQueries({ queryKey: queryKeys.friends });
      }
    },
  });
}

export function useAcceptInvitation() {
  return useInvitationResponse(API_ENDPOINTS.invitationAccept, true);
}

export function useDeclineInvitation() {
  return useInvitationResponse(API_ENDPOINTS.invitationDecline, false);
}

export function usePaySettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: string) =>
      apiSend("POST", API_ENDPOINTS.settlementPay(settlementId), undefined, {
        // Paying is idempotent on the server; a stable key also dedupes double clicks.
        "Idempotency-Key": `settlement-pay-${settlementId}`,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settlements });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      void queryClient.invalidateQueries({ queryKey: queryKeys.groups }); // also the group detail
      void queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
    },
  });
}

/** Applies a notification change to the cache immediately and rolls back on failure. */
function useOptimisticNotifications<TVariables>(
  request: (variables: TVariables) => Promise<unknown>,
  update: (list: NotificationList, variables: TVariables) => NotificationList,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications });
      const previous = queryClient.getQueryData<NotificationList>(
        queryKeys.notifications,
      );
      if (previous) {
        queryClient.setQueryData(
          queryKeys.notifications,
          update(previous, variables),
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications, context.previous);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });
}

const countUnread = (list: NotificationList["data"]) =>
  list.filter((item) => !item.read).length;

export function useMarkNotificationRead() {
  return useOptimisticNotifications(
    (id: string) => apiSend("POST", API_ENDPOINTS.notificationRead(id)),
    (list, id) => {
      const data = list.data.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      );
      return { data, unreadCount: countUnread(data) };
    },
  );
}

export function useMarkAllNotificationsRead() {
  return useOptimisticNotifications(
    () => apiSend("POST", API_ENDPOINTS.notificationsReadAll),
    (list) => ({
      data: list.data.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    }),
  );
}

export function useDismissNotification() {
  return useOptimisticNotifications(
    (id: string) => apiSend("DELETE", API_ENDPOINTS.notificationDismiss(id)),
    (list, id) => {
      const data = list.data.filter((item) => item.id !== id);
      return { data, unreadCount: countUnread(data) };
    },
  );
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      section: SettingsSection;
      values: Record<string, unknown>;
    }) => apiSend<Settings>("PATCH", API_ENDPOINTS.settings, payload),
    onSuccess: (settings, { section }) => {
      queryClient.setQueryData(queryKeys.settings, settings);
      if (section === "profile") {
        void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
        void queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      }
      if (section === "currency") {
        // Totals are converted to the preferred currency on the server.
        void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        void queryClient.invalidateQueries({ queryKey: queryKeys.allAnalytics });
      }
    },
  });
}
