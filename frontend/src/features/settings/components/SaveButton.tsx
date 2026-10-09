"use client";

import { Check, Loader2 } from "lucide-react";

export default function SaveButton({
  saved,
  pending = false,
  disabled = false,
  onClick,
}: {
  saved: boolean;
  pending?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        disabled={pending || disabled}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-60 ${saved ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
      >
        {saved ? (
          <>
            <Check size={14} strokeWidth={2.5} /> Saved
          </>
        ) : (
          <>
            {pending && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </>
        )}
      </button>
    </div>
  );
}
