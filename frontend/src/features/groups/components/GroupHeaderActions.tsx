"use client";

import { Camera, LogOut } from "lucide-react";

export default function GroupHeaderActions({
  onScan,
  onLeave,
}: {
  onScan: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <button
        onClick={onScan}
        className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500 font-semibold border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
      >
        <Camera size={13} /> Scan Receipt
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
