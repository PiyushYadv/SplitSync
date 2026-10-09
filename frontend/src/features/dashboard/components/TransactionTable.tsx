"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Hash } from "lucide-react";
import Avatar from "@/src/features/dashboard/components/Avatar";
import CurrencyBadge from "@/src/features/dashboard/components/CurrencyBadge";
import { formatDate } from "@/src/lib/format/date";
import { formatMoney } from "@/src/lib/format/money";
import type { Expense, GroupSummary } from "@/src/types/domain";

const SPLIT_STYLES = {
  equal: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  exact: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  percentage: "bg-amber-50 text-amber-700 ring-amber-200",
} as const;

/**
 * Each amount is shown in its group's currency, with the originally entered
 * amount underneath when it was in a different currency.
 */
export default function TransactionTable({
  title = "Transactions",
  expenses,
  groups,
  currentUserId,
  emptyMessage = "No expenses yet.",
}: {
  title?: string;
  expenses: Expense[];
  groups?: GroupSummary[];
  currentUserId?: string;
  emptyMessage?: string;
}) {
  // Amounts can be in different currencies, so the default order is by date.
  const [sort, setSort] = useState<"date" | "amount-desc" | "amount-asc">("date");
  const sorted =
    sort === "date"
      ? expenses
      : [...expenses].sort((a, b) =>
          sort === "amount-desc" ? b.amount - a.amount : a.amount - b.amount,
        );
  const groupMap = new Map(groups?.map((group) => [group.id, group]));
  const showGroup = Boolean(groups);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
            {expenses.length} items
          </span>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 dark:bg-slate-950/70">
              <th className={headerClass}>Title & Category</th>
              {showGroup && <th className={headerClass}>Group</th>}
              <th className={headerClass}>Paid By</th>
              <th className={headerClass}>Split</th>
              <th
                className={`${headerClass} cursor-pointer hover:text-slate-700 select-none`}
                onClick={() => setSort("date")}
              >
                Date
              </th>
              <th
                className={`${headerClass} cursor-pointer hover:text-slate-700 select-none`}
                onClick={() => setSort(sort === "amount-desc" ? "amount-asc" : "amount-desc")}
              >
                <div className="flex items-center gap-1">
                  Amount
                  {sort === "amount-desc" && <ChevronDown size={11} />}
                  {sort === "amount-asc" && <ChevronUp size={11} />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => {
              const group = groupMap.get(e.groupId);
              return (
                <tr
                  key={e.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${e.categoryColor}18` }}
                      >
                        <Hash size={12} style={{ color: e.categoryColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 leading-tight">{e.title}</p>
                        <p className="text-[11px] text-slate-400">{e.category}</p>
                      </div>
                    </div>
                  </td>
                  {showGroup && (
                    <td className="px-3 py-3">
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        {group ? `${group.emoji} ${group.name}` : "—"}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar member={e.paidBy} size={6} />
                      <span className="text-xs text-slate-700">
                        {e.paidByUserId === currentUserId ? "You" : e.paidBy.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 capitalize ${SPLIT_STYLES[e.splitType]}`}
                    >
                      {e.splitType}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{formatDate(e.date)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-slate-900">
                        {formatMoney(e.amount, e.currency)}
                      </span>
                      {e.originalCurrency !== e.currency && (
                        <div className="flex items-center gap-1">
                          <CurrencyBadge currency={e.originalCurrency} />
                          <span className="text-[10px] text-slate-400">
                            {formatMoney(e.originalAmount, e.originalCurrency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={showGroup ? 6 : 5} className="px-4 py-10 text-center text-sm text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const headerClass =
  "px-3 py-2.5 first:px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider";
