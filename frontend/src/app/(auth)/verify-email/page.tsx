"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/src/features/auth/components/AuthLayout";
import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

export default function VerifyEmail() {
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
        await apiRequest(API_ENDPOINTS.auth.verifyEmail(verificationToken));
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
