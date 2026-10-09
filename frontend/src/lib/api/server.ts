import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { API_URL, ApiError, type ApiErrorResponse } from "./client";

const SESSION_COOKIE = "splitsync_session";

/** Lets the Next.js server reach the backend on a private address in production. */
const SERVER_API_URL = process.env.API_INTERNAL_URL ?? API_URL;

/**
 * Fetches from the backend inside a Server Component. Server-side requests don't
 * carry the browser's cookies automatically, so the incoming session cookie is
 * forwarded explicitly.
 *
 * - 401 redirects to /login (the session expired or was revoked)
 * - 404 renders the nearest not-found page
 */
export async function serverApi<T>(path: string, loginRedirect = "/dashboard"): Promise<T> {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(loginRedirect)}`);
  }

  const response = await fetch(`${SERVER_API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      Cookie: `${SESSION_COOKIE}=${session.value}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect(`/login?next=${encodeURIComponent(loginRedirect)}`);
  }
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(
      response.status,
      body?.message ?? `Request to ${path} failed`,
      body?.code,
      body?.fieldErrors,
    );
  }
  return (await response.json()) as T;
}
