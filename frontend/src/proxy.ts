import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic auth check: send visitors without a session cookie to /login before
 * rendering the app. The backend still validates the session on every request;
 * an expired cookie is caught there and redirects to /login as well.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("splitsync_session")) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/analytics/:path*",
    "/settings/:path*",
  ],
};
