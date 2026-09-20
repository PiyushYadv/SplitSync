"use client";

import { useMemo, useState } from "react";
import type { Expense } from "@/src/data/groupData";

export default function GroupExpenseTable({
  expenses,
}: {
  expenses: Expense[];
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
        {visible.map((expense) => (
          <div key={expense.id} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {expense.title}
              </p>
              <p className="text-xs text-slate-400">
                {expense.category} · {expense.date}
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {expense.paidBy.name}
            </span>
            <span className="text-sm font-semibold text-slate-800">
              ${expense.amount.toFixed(2)}
            </span>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-400">
            No expenses found.
          </p>
        )}
      </div>
    </div>
  );
}
