"use client";

import { Suspense } from "react";
import TokenLinkPage from "@/src/features/auth/components/TokenLinkPage";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

// useSearchParams() needs a Suspense boundary so the rest of the page can be prerendered.
export default function ConfirmEmail() {
  return (
    <Suspense>
      <TokenLinkPage
        endpoint={API_ENDPOINTS.auth.confirmEmailChange}
        pending={{ title: "Confirming your new email…", description: "This only takes a moment." }}
        success={{
          title: "Email updated",
          description: "Use your new address the next time you sign in.",
        }}
      />
    </Suspense>
  );
}
