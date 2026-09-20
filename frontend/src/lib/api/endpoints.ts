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
  groups: "/groups",
  expenses: "/expenses",
  settlements: "/settlements",
  settlementPay: (id: string) => `/settlements/${encodeURIComponent(id)}/pay`,
  notifications: "/notifications",
  notificationRead: (id: string) =>
    `/notifications/${encodeURIComponent(id)}/read`,
  notificationDismiss: (id: string) =>
    `/notifications/${encodeURIComponent(id)}`,
  settings: "/me/settings",
} as const;
