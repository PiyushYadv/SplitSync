import axios, { AxiosError } from "axios";

export type ApiErrorResponse = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

/**
 * Browser client. The splitsync_session cookie is sent automatically because of
 * `withCredentials`; server components use `serverApi` (lib/api/server.ts) instead.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
    const isAuthCall = error.config?.url?.startsWith("/auth/");

    // An expired session anywhere in the app sends the user back to login. A full
    // page load (not router.push) also drops the old session's cached data.
    if (status === 401 && !isAuthCall && typeof window !== "undefined") {
      const next = window.location.pathname + window.location.search;
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- runs outside React; intentional hard reload
      window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    }

    const message =
      body?.message ??
      (status === 0
        ? "Can't reach the server. Check your connection and try again."
        : "Something went wrong. Please try again.");
    return Promise.reject(
      new ApiError(status, message, body?.code, body?.fieldErrors),
    );
  },
);

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await apiClient.get<T>(path, { params });
  return response.data;
}

export async function apiSend<T = void>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<T> {
  const response = await apiClient.request<T>({
    method,
    url: path,
    data: body,
    headers,
  });
  return response.data;
}

/** The user-facing message for any error thrown by a query or mutation. */
export function errorMessage(error: unknown, fallback = "Something went wrong") {
  return error instanceof Error && error.message ? error.message : fallback;
}
