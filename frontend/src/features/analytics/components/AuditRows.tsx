"use client";

import { AlertCircle } from "lucide-react";
import { formatRelativeTime } from "@/src/lib/format/date";
import type { AuditEntry } from "@/src/types/domain";

const COLORS: Record<string, string> = {
  add: "bg-emerald-100 text-emerald-700",
  settle: "bg-blue-100 text-blue-700",
  invite: "bg-amber-100 text-amber-700",
  join: "bg-indigo-100 text-indigo-700",
  leave: "bg-rose-100 text-rose-700",
  group: "bg-slate-100 text-slate-600",
};

export default function AuditRows({
  entries,
  currentUserId,
}: {
  entries: AuditEntry[];
  currentUserId?: string;
}) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-950/60 transition-colors"
        >
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 ${COLORS[entry.type] ?? COLORS.group}`}
          >
            {entry.type}
          </span>
          <div className="flex-1 min-w-0 truncate">
            <span className="text-xs font-semibold text-slate-700">{entry.label} </span>
            <span className="text-xs text-slate-500">
              by{" "}
              <span className="font-medium text-slate-700">
                {entry.actor ? (entry.actor.id === currentUserId ? "You" : entry.actor.name) : "Someone"}
              </span>
              {entry.target ? ` · ${entry.target}` : ""}
              {entry.groupName && entry.target !== entry.groupName ? ` · ${entry.groupName}` : ""}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            {formatRelativeTime(entry.createdAt)}
          </span>
        </div>
      ))}
      {entries.length === 0 && (
        <div className="py-10 text-center">
          <AlertCircle size={20} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No activity matches.</p>
        </div>
      )}
    </div>
  );
}
