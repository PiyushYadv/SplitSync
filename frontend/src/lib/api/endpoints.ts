const id = (value: string) => encodeURIComponent(value);

export const API_ENDPOINTS = {
  auth: {
    verifyEmail: (token: string) =>
      `/auth/verify?token=${encodeURIComponent(token)}`,
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    oauth: (provider: string) => `/auth/oauth/${provider.toLowerCase()}`,
    logout: "/auth/logout",
    currentUser: "/auth/me",
  },
  userSearch: "/users/search",
  friends: "/friends",
  dashboard: "/dashboard",
  analytics: "/analytics/summary",
  groups: "/groups",
  group: (groupId: string) => `/groups/${id(groupId)}`,
  groupInvitations: (groupId: string) => `/groups/${id(groupId)}/invitations`,
  groupLeave: (groupId: string) => `/groups/${id(groupId)}/leave`,
  invitations: "/invitations",
  invitationAccept: (invitationId: string) =>
    `/invitations/${id(invitationId)}/accept`,
  invitationDecline: (invitationId: string) =>
    `/invitations/${id(invitationId)}/decline`,
  expenses: "/expenses",
  settlements: "/settlements",
  settlementPay: (settlementId: string) =>
    `/settlements/${id(settlementId)}/pay`,
  notifications: "/notifications",
  notificationsReadAll: "/notifications/read-all",
  notificationRead: (notificationId: string) =>
    `/notifications/${id(notificationId)}/read`,
  notificationDismiss: (notificationId: string) =>
    `/notifications/${id(notificationId)}`,
  settings: "/me/settings",
} as const;
