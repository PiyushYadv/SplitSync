"use client";

import { DollarSign } from "lucide-react";
import { GROUPS, type Member } from "@/src/data/groupData";
import SplitTable from "./SplitTable";

type Split = {
  on: boolean;
  pct: number;
};

type ExpenseDetailsProps = {
  scanned: boolean;
  members: Member[];
  splits: Record<string, Split>;
  onToggleMember: (id: string) => void;
};

export default function ExpenseDetails({
  scanned,
  members,
  splits,
  onToggleMember,
}: ExpenseDetailsProps) {
  const splitCount = Object.values(splits).filter((v) => v.on).length;

  const perPerson =
    scanned && splitCount > 0 ? (83.05 / splitCount).toFixed(2) : "—";

  return (
    <div className="w-1/2 flex flex-col overflow-auto">
      <div className="p-5 flex-1 overflow-auto">
        <p className="text-xs font-semibold text-slate-700 mb-4">
          Expense Details
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            {
              label: "Merchant",
              value: scanned ? "Jimbaran Seafood Café" : "",
              placeholder: "Merchant name",
            },
            {
              label: "Category",
              value: scanned ? "Food & Drink" : "",
              placeholder: "Category",
            },
          ].map(({ label, value, placeholder }) => (
            <div key={label}>
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {label}
              </label>

              <input
                key={value}
                defaultValue={value}
                placeholder={placeholder}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total
            </label>

            <div className="relative">
              <DollarSign
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                key={scanned ? "amount" : "empty"}
                defaultValue={scanned ? "83.05" : ""}
                placeholder="0.00"
                className="w-full border border-slate-200 rounded-md pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Currency
            </label>

            <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              {["USD", "IDR", "EUR", "SGD"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Date
            </label>

            <input
              key={scanned ? "date" : "empty-date"}
              defaultValue={scanned ? "2025-07-23" : ""}
              type="date"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Group
          </label>

          <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            {GROUPS.map((group) => (
              <option key={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Paid By
          </label>

          <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
            {members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-700">
              Split Between
            </p>

            {scanned && splitCount > 0 && (
              <span className="text-[11px] text-slate-400">
                ${perPerson}/person
              </span>
            )}
          </div>

          <SplitTable
            members={members}
            splits={splits}
            scanned={scanned}
            onToggle={onToggleMember}
          />
        </div>
      </div>
    </div>
  );
}
