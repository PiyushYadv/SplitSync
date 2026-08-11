"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

// const FAQS = [
//   {
//     q: "How does the debt optimization work?",
//     a: "We model all balances as a directed weighted graph, then apply a minimum-cost flow algorithm to find the smallest set of transfers that clears every balance to zero.",
//   },
//   {
//     q: "Does everyone in my group need an account?",
//     a: "Only the group creator needs an account. Everyone else can view their balance and confirm payments through a shareable link — no signup required.",
//   },
//   {
//     q: "Which payment methods does SplitSync support?",
//     a: "We support Venmo, PayPal, Wise, and standard bank transfers (US, EU, and AU). We don't process payments ourselves — we initiate them via OAuth and track confirmation status.",
//   },
//   {
//     q: "How accurate is the OCR receipt scanning?",
//     a: "We consistently achieve 97–99% accuracy on clear photos of printed receipts. We flag low-confidence extractions and ask you to confirm before saving.",
//   },
//   {
//     q: "Can I export data for expense reimbursements?",
//     a: "Yes — Pro and Team plans include CSV and PDF export, formatted for QuickBooks and Xero.",
//   },
//   {
//     q: "Is my data safe?",
//     a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We are SOC 2 Type II certified and GDPR compliant.",
//   },
// ];

const FAQS = [
  {
    q: "How does the debt optimization work?",
    a: "We model group balances as a directed weighted graph and use a minimum-cost flow approach to consolidate debts into a smaller set of transfers, clearing each member's balance to zero.",
  },
  {
    q: "How does receipt extraction work?",
    a: "SplitSync uses Gemini to analyze receipt images and extract structured information such as the merchant, line items, date, currency, tax, and total. The extracted data is shown for review before the expense is saved.",
  },
  {
    q: "Can I correct extracted receipt data?",
    a: "Yes. Extracted fields can be reviewed and edited before creating the expense, allowing you to correct any information that was interpreted incorrectly.",
  },
  {
    q: "How can I split an expense?",
    a: "Expenses can be split by individual items, percentages, or exact amounts. SplitSync uses each member's share to calculate the group's balances and determine the resulting settlements.",
  },
  {
    q: "What happens when someone pays their balance?",
    a: "Settlement transactions can be marked as paid, allowing the group to keep track of outstanding and completed payments.",
  },
  {
    q: "What technologies power SplitSync?",
    a: "SplitSync is built with Next.js, TypeScript, React, and Tailwind CSS. Gemini powers the AI-based receipt extraction, while the settlement engine uses a directed graph and minimum-cost flow approach to optimize group payments.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Common questions
          </h2>
        </div>
        <div className="flex flex-col divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {FAQS.map(({ q, a }, i) => (
            <div key={q}>
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-sm font-semibold text-slate-900 pr-4">
                  {q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-4 bg-white">
                  <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
