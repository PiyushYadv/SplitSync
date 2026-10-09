"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import ExpenseForm from "@/src/features/expenses/components/ExpenseForm";
import ReceiptPreview from "./ReceiptPreview";

/** What the demo receipt in ReceiptPreview "scans" to. There is no OCR service yet. */
const DEMO_SCAN = {
  title: "Jimbaran Seafood Café",
  amount: "83.05",
  category: "Food & Drink",
};

export default function OCRModal({
  defaultGroupId,
  onClose,
}: {
  defaultGroupId?: string;
  onClose: () => void;
}) {
  const [scanned, setScanned] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-slate-200"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-50 rounded-md flex items-center justify-center">
              <Camera size={14} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add Expense — Receipt Scan</h2>
              <p className="text-[11px] text-slate-400">Upload a receipt or fill manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <ReceiptPreview
            scanned={scanned}
            onScan={() => {
              setTimeout(() => setScanned(true), 600);
            }}
          />
          <div className="w-1/2 overflow-auto">
            {/* Remount on scan so the form picks up the extracted values. */}
            <ExpenseForm
              key={scanned ? "scanned" : "manual"}
              defaultGroupId={defaultGroupId}
              prefill={scanned ? DEMO_SCAN : undefined}
              onCancel={onClose}
              onCreated={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
