const id = (value: string) => encodeURIComponent(value);

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/verify-email/resend",
    confirmEmailChange: "/auth/confirm-email-change",
    /** Full-page redirect into the provider's sign-in, not an XHR endpoint. */
    oauth: (provider: string) => `/auth/oauth/${id(provider)}`,
    logout: "/auth/logout",
    currentUser: "/auth/me",
  },
  config: "/config",
  receiptScan: "/receipts/scan",
  changeEmail: "/me/email",
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
