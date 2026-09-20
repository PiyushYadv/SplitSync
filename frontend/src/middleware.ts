import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_AUTH_GUARD !== "true") return NextResponse.next();
  const session = request.cookies.get("splitsync_session")?.value;
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/analytics/:path*",
    "/settings/:path*",
  ],
};
