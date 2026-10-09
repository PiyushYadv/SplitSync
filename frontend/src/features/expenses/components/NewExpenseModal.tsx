"use client";

import { X } from "lucide-react";
import ExpenseForm from "@/src/features/expenses/components/ExpenseForm";

export default function NewExpenseModal({
  defaultGroupId,
  onClose,
}: {
  defaultGroupId?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">New Expense</h2>
            <p className="text-xs text-slate-400 mt-0.5">Split with your group</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={14} />
          </button>
        </div>
        <ExpenseForm defaultGroupId={defaultGroupId} onCancel={onClose} onCreated={onClose} />
      </div>
    </div>
  );
}
