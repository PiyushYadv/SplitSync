"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { Group } from "@/src/data/groupData";
import { markSettlementPaid } from "@/src/lib/data/settlementMutations";

export default function SettlementPanel({ group }: { group: Group }) {
  const [settlements, setSettlements] = useState(group.settlements);
  const pending = settlements.filter((item) => !item.paid);
  const pay = async (id: string) => {
    setSettlements((items) =>
      items.map((entry) =>
        entry.id === id ? { ...entry, paid: true } : entry,
      ),
    );
    if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "api") return;
    try {
      await markSettlementPaid(id);
    } catch {
      setSettlements((items) =>
        items.map((entry) =>
          entry.id === id ? { ...entry, paid: false } : entry,
        ),
      );
    }
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Settlements</h3>
          <span className="text-[11px] text-slate-400">
            {pending.length} pending
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {pending.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-md p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-700">
                  {item.from.name}
                </span>
                <ArrowRight size={12} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-700">
                  {item.to.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  ${item.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => void pay(item.id)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600"
                >
                  <CheckCircle2 size={13} /> Mark paid
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              All settlements are complete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
