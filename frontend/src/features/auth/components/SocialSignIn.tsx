"use client";

import Image from "next/image";
import { API_URL } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import { useClientConfig } from "@/src/lib/data/queries";
import type { OAuthProvider } from "@/src/types/domain";

const PROVIDERS: Record<OAuthProvider, { label: string; icon: string }> = {
  google: { label: "Google", icon: "/icons/google.svg" },
  github: { label: "GitHub", icon: "/icons/github.svg" },
};

/** Messages for the `?error=` the backend adds when a Google/GitHub sign-in fails. */
export const OAUTH_ERRORS: Record<string, string> = {
  email_not_verified:
    "That account doesn't have a verified email address. Verify it with the provider, or sign up with email.",
  access_denied: "Sign-in was cancelled.",
  oauth_failed: "Couldn't sign you in with that account. Please try again.",
};

/**
 * "Continue with …" buttons for the providers the server has configured, followed
 * by an "or" divider. Renders nothing when none are.
 */
export default function SocialSignIn() {
  const { data: config } = useClientConfig();
  const providers = config?.oauthProviders ?? [];
  if (providers.length === 0) return null;

  return (
    <>
      <div className="mb-5 flex flex-col gap-3">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() =>
              // A full-page navigation to the API host, which redirects to the provider and back.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- absolute backend URL
              window.location.assign(`${API_URL}${API_ENDPOINTS.auth.oauth(provider)}`)
            }
            className="w-full flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Image src={PROVIDERS[provider].icon} alt="" width={18} height={18} />
            Continue with {PROVIDERS[provider].label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    </>
  );
}
