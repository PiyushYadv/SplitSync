"use client";

import { ArrowRight, LogOut } from "lucide-react";
import { GROUP_COLOR_STYLES } from "@/src/features/groups/types";
import { formatRelativeTime } from "@/src/lib/format/date";
import { formatMoney } from "@/src/lib/format/money";
import type { GroupSummary } from "@/src/types/domain";

export default function GroupCard({
  group,
  onOpen,
  onLeave,
}: {
  group: GroupSummary;
  onOpen: () => void;
  onLeave: () => void;
}) {
  const styles = GROUP_COLOR_STYLES[group.color] ?? GROUP_COLOR_STYLES.indigo;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        <button
          className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0"
          onClick={onOpen}
        >
          {group.emoji}
        </button>
        <button className="flex-1 min-w-0 text-left" onClick={onOpen}>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-slate-900 truncate">{group.name}</h3>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 capitalize ${styles.badge}`}
            >
              {group.status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {group.memberCount} member{group.memberCount === 1 ? "" : "s"} ·
            Last activity {formatRelativeTime(group.lastActivity)}
          </p>
        </button>
        <button className="text-right shrink-0" onClick={onOpen}>
          <p className="text-sm font-bold text-slate-900">
            {formatMoney(group.totalSpend, group.baseCurrency)}
          </p>
          <p className="text-xs text-slate-400">total spend</p>
        </button>
        <button className="text-right shrink-0 w-28" onClick={onOpen}>
          {group.balance !== 0 ? (
            <>
              <p
                className={`text-sm font-bold ${group.balance > 0 ? "text-emerald-600" : "text-rose-500"}`}
              >
                {formatMoney(Math.abs(group.balance), group.baseCurrency)}
              </p>
              <p className="text-xs text-slate-400">
                {group.balance > 0 ? "you are owed" : "you owe"}
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">settled up</p>
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpen}
            aria-label={`Open ${group.name}`}
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 border border-slate-200 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onLeave();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-md text-rose-600 border border-rose-200 bg-rose-50 hover:text-white hover:bg-rose-500 transition-colors"
            title="Leave group"
            aria-label={`Leave ${group.name}`}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
