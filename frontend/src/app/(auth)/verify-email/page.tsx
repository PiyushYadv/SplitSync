"use client";

import { Suspense } from "react";
import TokenLinkPage from "@/src/features/auth/components/TokenLinkPage";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

// useSearchParams() needs a Suspense boundary so the rest of the page can be prerendered.
export default function VerifyEmail() {
  return (
    <Suspense>
      <TokenLinkPage
        endpoint={API_ENDPOINTS.auth.verifyEmail}
        pending={{ title: "Verifying your email…", description: "This only takes a moment." }}
        success={{ title: "Email verified", description: "Thanks for confirming your address." }}
      />
    </Suspense>
  );
}
