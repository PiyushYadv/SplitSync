import { ArrowRight, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import DashboardMockup from "./DasboardMockup.tsx";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-0 overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          opacity: 0.35,
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-white via-white/90 to-white" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex justify-center mb-7">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5">
            <Sparkles size={13} className="text-indigo-500" />
            <span className="text-xs font-semibold text-indigo-700">
              Introducing AI receipt scanning — now in Beta
            </span>
            <Link
              href="#ocr"
              className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Learn more <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        <h1 className="text-center text-[56px] md:text-[72px] font-extrabold text-slate-900 tracking-[-0.03em] leading-[1.04] max-w-4xl mx-auto mb-6">
          Settle expenses.
          <br />
          <span className="text-indigo-600">Not friendships.</span>
        </h1>
        <p className="text-center text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          SplitSync is the intelligent expense-splitting platform for groups.
          Track multi-currency spend, scan receipts with AI, and settle every
          trip with the fewest possible transfers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/25 group"
          >
            Start for free{" "}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
          <button
            type="button"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold px-6 py-3 rounded-xl text-sm border border-slate-200 hover:border-slate-300 bg-white transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
              <Play
                size={8}
                className="text-slate-600 ml-0.5"
                fill="currentColor"
              />
            </div>
            Watch 2-min demo
          </button>
        </div>
        {/* <div className="flex items-center justify-center gap-6 mb-14 flex-wrap">
          <p className="text-xs text-slate-400 font-medium">
            Trusted by 200,000+ people on their trips
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className="text-amber-400 fill-amber-400"
              />
            ))}
            <span className="text-xs text-slate-500 ml-1.5">
              4.9 / 5 on Product Hunt
            </span>
          </div>
        </div> */}
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute -inset-x-20 -top-10 h-32 bg-indigo-500/8 blur-3xl pointer-events-none rounded-full" />
          <div className="relative bg-white rounded-xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                  <div
                    key={c}
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex-1 max-w-xs mx-auto">
                <div className="bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] text-slate-400 text-center">
                  app.splitsync.io/dashboard
                </div>
              </div>
            </div>
            <DashboardMockup />
          </div>
        </div>
      </div>
      <div className="h-32 bg-linear-to-b from-transparent to-slate-50 -mt-0.5" />
    </section>
  );
}
