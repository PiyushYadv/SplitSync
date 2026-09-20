import axios, { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 0;
    const details = error.response?.data;
    const message = details?.message ?? error.message ?? "Request failed";
    return Promise.reject(new ApiError(status, message, details));
  },
);

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const data =
    typeof init.body === "string" ? JSON.parse(init.body) : init.body;
  const response = await apiClient.request<T>({
    url: path,
    method: init.method?.toLowerCase() ?? "get",
    headers: Object.fromEntries(headers.entries()),
    data,
  });
  return response.data;
}
