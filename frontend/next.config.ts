import type { NextConfig } from "next";

/**
 * In production the browser calls the API on this app's own origin (NEXT_PUBLIC_API_URL=/api) and
 * these rewrites proxy it to the backend, so the session cookie is first-party without a custom
 * domain. Locally the browser calls the backend directly and no rewrite is needed.
 */
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
const backendApiUrl = process.env.API_INTERNAL_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!publicApiUrl.startsWith("/") || !backendApiUrl) return [];
    return [{ source: `${publicApiUrl}/:path*`, destination: `${backendApiUrl}/:path*` }];
  },
};

export default nextConfig;
