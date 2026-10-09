"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import AuthLayout from "@/src/features/auth/components/AuthLayout";
import FormInput from "@/src/features/auth/components/FormInput";
import { apiSend } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPassword() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>();

  async function onSubmit(data: ForgotPasswordForm) {
    setErrorMessage(null);
    try {
      await apiSend("POST", API_ENDPOINTS.auth.forgotPassword, data);
      setDone(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send reset link",
      );
    }
  }

  return (
    <AuthLayout
      title={done ? "Check your inbox" : "Forgot your password?"}
      description={
        done
          ? `If an account exists for ${getValues("email")}, we've sent it a reset link`
          : "Enter your email and we'll send you a reset link"
      }
    >
      {done ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={24} className="text-emerald-500" strokeWidth={2.5} />
          </div>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Back to login
          </button>

          <button
            type="button"
            onClick={() => setDone(false)}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600 block w-full"
          >
            Try a different email
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {errorMessage && (
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
                {errorMessage}
              </p>
            )}
            <FormInput
              label="Email address"
              type="email"
              placeholder="you@company.com"
              registration={register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address",
                },
              })}
              error={errors.email?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors group"
            >
              Send reset link
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-semibold hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
