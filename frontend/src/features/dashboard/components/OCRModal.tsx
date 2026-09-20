"use client";

import { useState } from "react";
import { Camera, Plus, X } from "lucide-react";

import { GROUPS } from "@/src/data/groupData";

import ReceiptPreview from "./ReceiptPreview";
import ExpenseDetails from "./ExpenseDetails";

type OCRModalProps = {
  onClose: () => void;
};

export default function OCRModal({ onClose }: OCRModalProps) {
  const [scanned, setScanned] = useState(false);

  const members = GROUPS[0].members;

  const [splits, setSplits] = useState<
    Record<string, { on: boolean; pct: number }>
  >(
    Object.fromEntries(
      members.map((member) => [
        member.id,
        {
          on: true,
          pct: 20,
        },
      ]),
    ),
  );

  function toggleMember(id: string) {
    setSplits((prev) => {
      const next = {
        ...prev,
        [id]: {
          ...prev[id],
          on: !prev[id].on,
        },
      };

      const onCount = Object.values(next).filter((value) => value.on).length;

      if (onCount === 0) {
        return prev;
      }

      const pct = Math.round(100 / onCount);
      let remaining = 100;

      Object.keys(next)
        .filter((key) => next[key].on)
        .forEach((key, index, activeKeys) => {
          next[key].pct = index === activeKeys.length - 1 ? remaining : pct;

          remaining -= pct;
        });

      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden border border-slate-200"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-50 rounded-md flex items-center justify-center">
              <Camera size={14} className="text-indigo-600" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Add Expense — OCR Scan
              </h2>

              <p className="text-[11px] text-slate-400">
                Upload a receipt or fill manually
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <ReceiptPreview
            scanned={scanned}
            onScan={() => {
              setTimeout(() => setScanned(true), 600);
            }}
          />

          <ExpenseDetails
            scanned={scanned}
            members={members}
            splits={splits}
            onToggleMember={toggleMember}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
