"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Category = { name: string; value: number; color: string };

export default function CategoryBreakdown({ data }: { data: Category[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Category Breakdown
      </h3>
      <p className="text-[11px] text-slate-400 mb-4">Trip to Bali · Jul 2025</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? [`$${value.toFixed(2)}`, ""]
                : ["", ""]
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5 mt-2">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-[11px] text-slate-600 flex-1">{name}</span>
            <span className="text-[11px] font-semibold text-slate-800">
              ${value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
