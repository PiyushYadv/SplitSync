"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/src/features/auth/components/AuthLayout";
import { apiGet } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      return;
    }
    const verificationToken = token;

    async function verify() {
      try {
        await apiGet(API_ENDPOINTS.auth.verifyEmail(verificationToken));
        setMessage("Email verified successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Verification failed",
        );
      }
    }

    void verify();
  }, [params, router]);

  return (
    <AuthLayout
      title={message}
      description="You can close this page once verification is complete."
    />
  );
}

// useSearchParams() needs a Suspense boundary so the rest of the page can be prerendered.
export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
