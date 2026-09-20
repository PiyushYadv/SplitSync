"use client";

import { Check } from "lucide-react";

export default function SaveButton({
  saved,
  onClick,
}: {
  saved: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${saved ? "bg-emerald-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
      >
        {saved ? (
          <>
            <Check size={14} strokeWidth={2.5} /> Saved
          </>
        ) : (
          "Save changes"
        )}
      </button>
    </div>
  );
}
