"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit2,
  Filter,
  Hash,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { GROUPS, type Expense } from "@/src/data/groupData";

import Avatar from "@/src/features/dashboard/components/Avatar";
import CurrencyBadge from "@/src/features/dashboard/components/CurrencyBadge";
import { formatAmount } from "@/src/lib/formatAmount";

type TransactionTableProps = {
  expenses: Expense[];
  showGroup?: boolean;
  currencyMeta?: { symbol: string; rate: number };
};

export default function TransactionTable({
  expenses,
  showGroup = false,
  currencyMeta = { symbol: "$", rate: 1 },
}: TransactionTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleAll = () =>
    setSelected(
      selected.size === expenses.length
        ? new Set()
        : new Set(expenses.map((e) => e.id)),
    );
  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  };
  const sorted = [...expenses].sort((a, b) =>
    sortDir === "desc" ? b.amount - a.amount : a.amount - b.amount,
  );
  const groupMap = Object.fromEntries(GROUPS.map((g) => [g.id, g]));

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Transactions</h2>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
            {expenses.length} items
          </span>
          {selected.size > 0 && (
            <span className="text-[11px] text-indigo-600 font-medium">
              {selected.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2.5 py-1.5 transition-colors">
            <Filter size={12} /> Filter
          </button>
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2.5 py-1.5 transition-colors">
            <Download size={12} /> Export
          </button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 dark:bg-slate-950/70">
              <th className="px-4 py-2.5 w-10">
                <input
                  type="checkbox"
                  checked={
                    selected.size === expenses.length && expenses.length > 0
                  }
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                />
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Title & Category
              </th>
              {showGroup && (
                <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Group
                </th>
              )}
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Paid By
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Split
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th
                className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
              >
                <div className="flex items-center gap-1">
                  Amount{" "}
                  {sortDir === "desc" ? (
                    <ChevronDown size={11} />
                  ) : (
                    <ChevronUp size={11} />
                  )}
                </div>
              </th>
              <th className="px-3 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e, i) => {
              const grp = groupMap[e.groupId];
              return (
                <tr
                  key={e.id}
                  className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${selected.has(e.id) ? "bg-indigo-50/40" : ""} ${i === sorted.length - 1 ? "border-b-0" : ""}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(e.id)}
                      onChange={() => toggle(e.id)}
                      className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${e.categoryColor}18` }}
                      >
                        <Hash size={12} style={{ color: e.categoryColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 leading-tight">
                          {e.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {e.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  {showGroup && (
                    <td className="px-3 py-3">
                      <span className="text-xs text-slate-600 flex items-center gap-1">
                        {grp?.emoji} {grp?.name}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar member={e.paidBy} size={6} />
                      <span className="text-xs text-slate-700">
                        {e.paidBy.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${e.splitType === "Equal" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : e.splitType === "Exact" ? "bg-indigo-50 text-indigo-700 ring-indigo-200" : "bg-amber-50 text-amber-700 ring-amber-200"}`}
                    >
                      {e.splitType}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{e.date}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-slate-900">
                        {formatAmount(e.amount, currencyMeta)}
                      </span>
                      {e.originalCurrency ? (
                        <div className="flex items-center gap-1">
                          <CurrencyBadge currency={e.originalCurrency} />
                          <span className="text-[10px] text-slate-400">
                            {e.originalAmount?.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <CurrencyBadge currency={e.currency} />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button className="w-6 h-6 rounded hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                      <button className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                        <MoreHorizontal size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
