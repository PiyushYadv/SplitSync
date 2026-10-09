"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import AuthLayout from "@/src/features/auth/components/AuthLayout";
import { apiSend, errorMessage } from "@/src/lib/api/client";
import { queryKeys } from "@/src/lib/query/keys";

type Copy = { title: string; description: string };

/**
 * Landing page for an emailed link: redeems `?token=` once against `endpoint`.
 * Tokens are single-use, so the request must not repeat (e.g. on a dev-mode
 * double effect).
 */
export default function TokenLinkPage({
  endpoint,
  pending,
  success,
}: {
  endpoint: string;
  pending: Copy;
  success: Copy;
}) {
  const token = useSearchParams().get("token");
  const queryClient = useQueryClient();
  const sent = useRef(false);
  const [state, setState] = useState<
    { status: "pending" } | { status: "done" } | { status: "error"; message: string }
  >(token ? { status: "pending" } : { status: "error", message: "This link is missing its token." });

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    apiSend("POST", endpoint, { token })
      .then(() => {
        setState({ status: "done" });
        // The verification banner and settings read these.
        void queryClient.invalidateQueries({ queryKey: queryKeys.currentUser });
        void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      })
      .catch((error) => setState({ status: "error", message: errorMessage(error) }));
  }, [endpoint, token, queryClient]);

  const copy =
    state.status === "done"
      ? success
      : state.status === "error"
        ? { title: "Link didn't work", description: state.message }
        : pending;

  return (
    <AuthLayout title={copy.title} description={copy.description}>
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 border ${
            state.status === "done"
              ? "bg-emerald-50 border-emerald-200"
              : state.status === "error"
                ? "bg-rose-50 border-rose-200"
                : "bg-slate-50 border-slate-200"
          }`}
        >
          {state.status === "done" ? (
            <Check size={24} className="text-emerald-500" strokeWidth={2.5} />
          ) : state.status === "error" ? (
            <X size={24} className="text-rose-500" strokeWidth={2.5} />
          ) : (
            <Loader2 size={24} className="text-slate-400 animate-spin" />
          )}
        </div>
        {state.status !== "pending" && (
          <Link
            href="/dashboard"
            className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Continue to SplitSync
          </Link>
        )}
      </div>
    </AuthLayout>
  );
}
