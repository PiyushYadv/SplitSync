import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

type AuthLayoutProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-6"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <RefreshCw size={16} className="text-white" strokeWidth={2.5} />
            </div>
          </button>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-slate-500 mt-1.5">{description}</p>
        </div>

        {children}

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-slate-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
