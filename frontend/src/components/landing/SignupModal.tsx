"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Link, RefreshCw, X } from "lucide-react";

export default function SignupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <RefreshCw size={13} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-sm">SplitSync</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {step === "signup" ? (
          <div className="p-6">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
              Create your account
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Free forever for groups of up to 3. No credit card needed.
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <button
                type="button"
                className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1"
              >
                Create account
              </button>
            </div>
            <p className="text-center text-xs text-slate-400 mt-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 font-semibold hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check size={24} className="text-emerald-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              We sent a verification link to{" "}
              <span className="font-semibold text-slate-700">
                {email || "your email"}
              </span>
              .
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push("/dashboard");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Go to dashboard
            </button>
            <button
              type="button"
              onClick={() => setStep("signup")}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
