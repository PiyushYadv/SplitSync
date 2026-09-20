"use client";

import { useRouter } from "next/navigation";
import { RefreshCw, ArrowRight } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div
      className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8">
        <RefreshCw size={20} className="text-white" strokeWidth={2.5} />
      </div>
      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
        404
      </p>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page not found
      </h1>
      <p className="text-slate-500 max-w-sm mb-8">
        {"This page doesn't exist or was moved. Let's get you back on track."}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors group"
        >
          Back to home{" "}
          <ArrowRight
            size={15}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-5 py-2.5 rounded-xl transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
