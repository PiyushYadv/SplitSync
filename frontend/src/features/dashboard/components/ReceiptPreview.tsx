"use client";

import { Check, Upload } from "lucide-react";

type ReceiptPreviewProps = {
  scanned: boolean;
  onScan: () => void;
};

export default function ReceiptPreview({
  scanned,
  onScan,
}: ReceiptPreviewProps) {
  return (
    <div className="w-1/2 border-r border-slate-200 p-5 flex flex-col overflow-auto bg-slate-50">
      <p className="text-xs font-semibold text-slate-700 mb-3">
        Receipt Preview
      </p>

      {!scanned ? (
        <div
          className="flex-1 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer min-h-64"
          onClick={onScan}
        >
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mb-4">
            <Upload size={22} className="text-slate-500" />
          </div>

          <p className="text-sm font-semibold text-slate-700 mb-1">
            Drop receipt here
          </p>

          <p className="text-xs text-slate-400 text-center mb-4">
            PNG, JPG, PDF up to 10MB
          </p>

          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            Browse files
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onScan();
            }}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-500 underline"
          >
            Demo: simulate scan →
          </button>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
          <div className="relative bg-white font-mono text-xs p-5 leading-relaxed">
            <div className="text-center mb-4">
              <p className="font-bold text-sm text-slate-900">
                JIMBARAN SEAFOOD CAFÉ
              </p>

              <p className="text-slate-500">Jl. Bukit Permai, Jimbaran</p>

              <p className="text-slate-400 mt-1">Jul 23, 2025 · Table 7</p>
            </div>

            <div className="border-t border-dashed border-slate-300 my-3" />

            {[
              ["2× Grilled Barramundi", "$42.00"],
              ["1× Coconut curry", "$18.50"],
              ["3× Bintang Beer", "$15.00"],
              ["Tax (10%)", "$7.55"],
              ["TOTAL", "$83.05"],
            ].map(([label, amount]) => (
              <div key={label} className="flex justify-between py-1 relative">
                <div className="absolute inset-0 bg-emerald-400/10 border border-emerald-300/40 rounded pointer-events-none" />

                <span className="text-slate-700">{label}</span>

                <span className="font-semibold text-slate-900">{amount}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-t border-emerald-200">
            <Check size={13} className="text-emerald-600" strokeWidth={2.5} />

            <span className="text-xs font-semibold text-emerald-700">
              5 line items detected · Confidence 98%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
