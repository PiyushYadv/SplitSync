"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import AuthLayout from "@/src/features/auth/components/AuthLayout";
import PasswordInput from "@/src/features/auth/components/PasswordInput";
import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>();

  const password = useWatch({
    control,
    name: "password",
  });

  async function onSubmit(data: ResetPasswordForm) {
    if (!token) {
      setErrorMessage("This reset link is invalid or expired");
      return;
    }
    setErrorMessage(null);
    try {
      await apiRequest(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
      });
      setDone(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to reset password",
      );
    }
  }

  return (
    <AuthLayout
      title={done ? "Password reset" : "Reset your password"}
      description={
        done
          ? "Your password has been successfully updated"
          : "Choose a new password for your SplitSync account"
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
            <PasswordInput
              label="New password"
              placeholder="Min. 8 characters"
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
              registration={register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              error={errors.password?.message}
            />

            <PasswordInput
              label="Confirm password"
              placeholder="Min. 8 characters"
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
              registration={register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1 group"
            >
              Reset password
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
