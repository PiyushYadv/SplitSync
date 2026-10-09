"use client";

import { useMemo, useState } from "react";
import CurrencyBadge from "@/src/features/dashboard/components/CurrencyBadge";
import { formatDate } from "@/src/lib/format/date";
import { formatMoney } from "@/src/lib/format/money";
import type { Expense } from "@/src/types/domain";

export default function GroupExpenseTable({
  expenses,
  currentUserId,
}: {
  expenses: Expense[];
  currentUserId?: string;
}) {
  const [query, setQuery] = useState("");
  const [sortDescending, setSortDescending] = useState(true);
  const visible = useMemo(
    () =>
      expenses
        .filter(
          (expense) =>
            expense.title.toLowerCase().includes(query.toLowerCase()) ||
            expense.category.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sortDescending ? b.amount - a.amount : a.amount - b.amount,
        ),
    [expenses, query, sortDescending],
  );
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Transactions</h2>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search expenses"
            className="border border-slate-200 rounded-md px-2.5 py-1.5 text-xs"
          />
          <button
            onClick={() => setSortDescending((value) => !value)}
            className="text-xs font-semibold text-slate-500"
          >
            Amount {sortDescending ? "↓" : "↑"}
          </button>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {visible.map((expense) => {
          const myShare = expense.splits.find((split) => split.userId === currentUserId);
          return (
            <div key={expense.id} className="flex items-center gap-4 px-4 py-3">
              <div
                className="w-2 h-8 rounded-full shrink-0"
                style={{ backgroundColor: expense.categoryColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {expense.title}
                </p>
                <p className="text-xs text-slate-400">
                  {expense.category} · {formatDate(expense.date)} · {expense.splitType} split
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">
                  {expense.paidByUserId === currentUserId ? "You" : expense.paidBy.name} paid
                </p>
                {myShare && (
                  <p className="text-[11px] text-slate-400">
                    your share {formatMoney(myShare.amount, expense.currency)}
                  </p>
                )}
              </div>
              <div className="text-right w-28">
                <p className="text-sm font-semibold text-slate-800">
                  {formatMoney(expense.amount, expense.currency)}
                </p>
                {expense.originalCurrency !== expense.currency && (
                  <div className="flex items-center justify-end gap-1">
                    <CurrencyBadge currency={expense.originalCurrency} />
                    <span className="text-[10px] text-slate-400">
                      {formatMoney(expense.originalAmount, expense.originalCurrency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            {expenses.length === 0 ? "No expenses yet." : "No expenses match your search."}
          </p>
        )}
      </div>
    </div>
  );
}
