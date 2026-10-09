"use client";

import { Loader2, LogOut } from "lucide-react";

export default function LeaveGroupModal({
  name,
  pending = false,
  error,
  onConfirm,
  onClose,
}: {
  name: string;
  pending?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
          <LogOut size={20} className="text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Leave {name}?
        </h2>
        <p className="text-sm text-slate-500 mb-4">
          You will no longer see this group or its expenses. You can only leave
          once your balance in the group is settled.
        </p>
        {error && (
          <p className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-600">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-500 disabled:opacity-60 text-white rounded-lg py-2.5 text-sm font-semibold"
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Leave Group
          </button>
        </div>
      </div>
    </div>
  );
}
