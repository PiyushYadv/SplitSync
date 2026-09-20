"use client";

import { useState } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";

import type { Settlement } from "@/src/data/groupData";
import Avatar from "@/src/features/dashboard/components/Avatar";

type SettlementSidebarProps = {
  settlements: Settlement[];
  netBalance: number;
  balanceRows: {
    label: string;
    amount: string;
    color: string;
  }[];
};

export default function SettlementSidebar({
  settlements,
  netBalance,
  balanceRows,
}: SettlementSidebarProps) {
  const [items, setItems] = useState(settlements);
  const pending = items.filter((s) => !s.paid);
  const done = items.filter((s) => s.paid);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Debt Matrix</h3>
          <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold ring-1 ring-emerald-200">
            Optimized
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md mb-3">
          <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center shrink-0">
            <Zap size={13} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {items.length} debts → {pending.length} pending
            </p>
            <p className="text-[11px] text-slate-400">
              Min. transactions algorithm
            </p>
          </div>
        </div>

        {pending.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pending
            </p>
            <div className="flex flex-col gap-2">
              {pending.map((s) => (
                <div
                  key={s.id}
                  className="border border-slate-200 rounded-md p-3"
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <Avatar member={s.from} size={6} />
                    <span className="text-xs font-medium text-slate-700">
                      {s.from.name}
                    </span>
                    <ArrowRight size={12} className="text-slate-400 mx-0.5" />
                    <span className="text-xs font-medium text-slate-700">
                      {s.to.name}
                    </span>
                    <Avatar member={s.to} size={6} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      ${s.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() =>
                        setItems((prev) =>
                          prev.map((x) =>
                            x.id === s.id ? { ...x, paid: true } : x,
                          ),
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded transition-colors"
                    >
                      <Check size={10} strokeWidth={3} /> Settle Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Settled
            </p>
            {done.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md opacity-50"
              >
                <Avatar member={s.from} size={5} />
                <span className="text-xs text-slate-500">{s.from.name}</span>
                <ArrowRight size={10} className="text-slate-400" />
                <span className="text-xs text-slate-500 flex-1">
                  {s.to.name}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ${s.amount.toFixed(2)}
                </span>
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check
                    size={9}
                    className="text-emerald-600"
                    strokeWidth={3}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {pending.length === 0 && done.length === 0 && (
          <div className="text-center py-4">
            <Check size={20} className="text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-700">All square!</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Your Balance
        </h3>
        <div className="flex flex-col gap-2">
          {balanceRows.map(({ label, amount, color }) => (
            <div
              key={label}
              className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
            >
              <span className="text-xs text-slate-600">{label}</span>
              <span className={`text-xs font-bold ${color}`}>{amount}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1 mt-0.5">
            <span className="text-xs font-semibold text-slate-800">Net</span>
            <span
              className={`text-sm font-bold ${netBalance >= 0 ? "text-emerald-600" : "text-rose-500"}`}
            >
              {netBalance >= 0 ? "+" : "−"}${Math.abs(netBalance).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
