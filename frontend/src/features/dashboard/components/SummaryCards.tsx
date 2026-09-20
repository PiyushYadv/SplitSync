"use client";

import type { LucideIcon } from "lucide-react";

export type SummaryCard = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  iconBg: string;
  trend: string;
};

export default function SummaryCards({ cards }: { cards: SummaryCard[] }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-5">
      {cards.map(({ label, value, sub, icon: Icon, color, iconBg, trend }) => (
        <div
          key={label}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={`w-8 h-8 ${iconBg} rounded-md flex items-center justify-center shrink-0`}
            >
              <Icon size={15} className={color} />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {trend}
            </span>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${color} mb-0.5`}>
            {value}
          </p>
          <p className="text-xs font-semibold text-slate-700">{label}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}
