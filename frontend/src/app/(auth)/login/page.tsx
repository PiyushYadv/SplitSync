"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import AuthLayout from "@/src/features/auth/components/AuthLayout";
import SocialButton from "@/src/features/auth/components/SocialButton";
import FormInput from "@/src/features/auth/components/FormInput";
import PasswordInput from "@/src/features/auth/components/PasswordInput";
import { apiRequest } from "@/src/lib/api/client";
import { API_ENDPOINTS } from "@/src/lib/api/endpoints";
import type { LoginResponse } from "@/src/lib/api/contracts";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setErrorMessage(null);
    try {
      await apiRequest<LoginResponse>(API_ENDPOINTS.auth.login, {
        method: "POST",
        body: JSON.stringify(data),
      });
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in",
      );
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your SplitSync account"
    >
      <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
        <div className="mb-5 flex flex-col gap-3">
          <SocialButton provider="Google" />
          <SocialButton provider="Github" />
          <SocialButton provider="Apple" />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-indigo-600 hover:text-indigo-500"
              >
                Forgot?
              </Link>
            </div>

            <PasswordInput
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1 group"
          >
            Sign in
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">
          {"Don't have an account?"}{" "}
          <Link
            href="/signup"
            className="text-indigo-600 font-semibold hover:text-indigo-500"
          >
            Sign up free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
