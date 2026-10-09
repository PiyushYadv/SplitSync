"use client";

import { Camera, LogOut, Plus, UserPlus } from "lucide-react";

export default function GroupHeaderActions({
  onAddExpense,
  onScan,
  onInvite,
  onLeave,
}: {
  onAddExpense: () => void;
  onScan: () => void;
  onInvite: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        onClick={onInvite}
        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold border border-slate-200 bg-white px-3 py-1.5 rounded-md transition-colors"
      >
        <UserPlus size={13} /> Invite
      </button>
      <button
        onClick={onScan}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500 font-semibold border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
      >
        <Camera size={13} /> Scan Receipt
      </button>
      <button
        onClick={onAddExpense}
        className="flex items-center gap-1.5 text-xs text-white font-semibold bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-md transition-colors"
      >
        <Plus size={13} /> Add Expense
      </button>
      <button
        onClick={onLeave}
        className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold border border-rose-200 bg-rose-50 px-3 py-1.5 rounded-md transition-colors"
      >
        <LogOut size={13} /> Leave
      </button>
    </div>
  );
}
