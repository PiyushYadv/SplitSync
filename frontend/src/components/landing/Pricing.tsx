"use client";

import { Check } from "lucide-react";
import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: { mo: 0, yr: 0 },
    desc: "Perfect for occasional trips.",
    features: [
      "3 active groups",
      "20 expenses / month",
      "Manual entry only",
      "Basic settlement",
      "Email support",
    ],
    cta: "Get started",
    highlight: false,
  },
  {
    name: "Pro",
    price: { mo: 9, yr: 6 },
    desc: "For frequent travelers and active groups.",
    features: [
      "Unlimited groups",
      "Unlimited expenses",
      "AI receipt scanning (OCR)",
      "180+ currencies + live rates",
      "Debt optimization algorithm",
      "Payment integrations",
      "Spend analytics",
    ],
    cta: "Start 14-day trial",
    highlight: true,
  },
  {
    name: "Team",
    price: { mo: 19, yr: 14 },
    desc: "For companies and event organizers.",
    features: [
      "Everything in Pro",
      "Team workspace + admin",
      "CSV / PDF export",
      "Audit log & compliance",
      "Priority support (4h SLA)",
      "Custom expense categories",
      "SSO & SCIM provisioning",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-slate-500 mb-8 text-lg">
            No per-member fees. No hidden charges. Cancel anytime.
          </p>
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[false, true].map((yr) => (
              <button
                type="button"
                key={String(yr)}
                onClick={() => setAnnual(yr)}
                className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-semibold transition-all ${annual === yr ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {yr ? "Annual" : "Monthly"}
                {yr && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Save 33%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5 items-start max-w-5xl mx-auto">
          {PLANS.map(({ name, price, desc, features, cta, highlight }) => {
            const p = annual ? price.yr : price.mo;
            return (
              <div
                key={name}
                className={`relative rounded-2xl p-7 border ${highlight ? "border-indigo-300 bg-indigo-600 shadow-2xl shadow-indigo-500/20 scale-[1.02]" : "border-slate-200 bg-white"}`}
              >
                {highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-white text-indigo-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-indigo-200">
                      Most popular
                    </span>
                  </div>
                )}
                <p
                  className={`text-sm font-bold mb-1 ${highlight ? "text-indigo-200" : "text-slate-500"}`}
                >
                  {name}
                </p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span
                    className={`text-4xl font-extrabold tracking-tight ${highlight ? "text-white" : "text-slate-900"}`}
                  >
                    {p === 0 ? "Free" : `$${p}`}
                  </span>
                  {p > 0 && (
                    <span
                      className={`text-sm mb-1.5 ${highlight ? "text-indigo-300" : "text-slate-400"}`}
                    >
                      /month
                    </span>
                  )}
                </div>
                {annual && p > 0 && (
                  <p
                    className={`text-xs mb-3 ${highlight ? "text-indigo-300" : "text-slate-400"}`}
                  >
                    Billed ${p * 12}/year
                  </p>
                )}
                <p
                  className={`text-sm mb-6 ${highlight ? "text-indigo-200" : "text-slate-500"}`}
                >
                  {desc}
                </p>
                <button
                  type="button"
                  className={`w-full py-2.5 rounded-xl text-sm font-bold mb-6 transition-all ${highlight ? "bg-white text-indigo-700 hover:bg-indigo-50" : "border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/50"}`}
                >
                  {cta}
                </button>
                <ul className="flex flex-col gap-2.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        size={14}
                        className={`shrink-0 mt-0.5 ${highlight ? "text-indigo-300" : "text-emerald-500"}`}
                        strokeWidth={2.5}
                      />
                      <span
                        className={
                          highlight ? "text-indigo-100" : "text-slate-600"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-slate-400 mt-8">
          All plans include a 14-day free trial. No credit card required to
          start.
        </p>
      </div>
    </section>
  );
}
