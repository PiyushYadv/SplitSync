"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import SocialButton from "@/src/features/auth/components/SocialButton";
import FormInput from "@/src/features/auth/components/FormInput";
import PasswordInput from "@/src/features/auth/components/PasswordInput";
import AuthLayout from "@/src/features/auth/components/AuthLayout";
import { errorMessage as messageOf } from "@/src/lib/api/client";
import { useLogin, useSignup } from "@/src/lib/data/mutations";

type SignupForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Signup() {
  const router = useRouter();
  const signup = useSignup();
  const login = useLogin();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>();

  const password = useWatch({
    control,
    name: "password",
  });

  async function onSubmit(data: SignupForm) {
    setErrorMessage(null);
    try {
      const credentials = { email: data.email, password: data.password };
      const { verificationRequired } = await signup.mutateAsync({
        name: data.name.trim(),
        ...credentials,
      });
      if (verificationRequired) {
        setDone(true);
        return;
      }
      // No email verification step yet: sign the new user straight in.
      await login.mutateAsync(credentials);
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(messageOf(error, "Unable to create your account"));
    }
  }

  return (
    <AuthLayout
      title={done ? "Check your inbox" : "Create account"}
      description={
        done
          ? "We sent a verification link to your email"
          : "Create your free SplitSync account"
      }
    >
      {done ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={24} className="text-emerald-500" strokeWidth={2.5} />
          </div>

          <p className="w-full bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl text-sm text-center">
            Check your inbox
          </p>

          <button
            type="button"
            onClick={() => setDone(false)}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600 block w-full"
          >
            Use a different email
          </button>
        </div>
      ) : (
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            {errorMessage && (
              <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
                {errorMessage}
              </p>
            )}
            <FormInput
              label="Full name"
              type="text"
              placeholder="Alex Johnson"
              registration={register("name", {
                required: "Name is required",
                validate: (value) => value.trim().length > 0 || "Name is required",
                maxLength: { value: 255, message: "Name is too long" },
              })}
              error={errors.name?.message}
            />

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

            <PasswordInput
              label="Password"
              placeholder="Min. 8 characters"
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((prev) => !prev)}
              registration={register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                maxLength: {
                  value: 72,
                  message: "Password must be at most 72 characters",
                },
              })}
              error={errors.password?.message}
            />

            <PasswordInput
              label="Confirm Password"
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
              Create account
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 mt-5">
            {"Already have an account?"}{" "}
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
