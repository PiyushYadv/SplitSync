"use client";

import { useState } from "react";
import { formatMonth } from "@/src/lib/format/date";
import { formatMoney } from "@/src/lib/format/money";

const WIDTH = 560;
const HEIGHT = 200;
const LEFT = 52;
const RIGHT = 10;
const TOP = 12;
const BOTTOM = 24;

function compact(value: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function SpendingLineChart({
  data,
  currency,
}: {
  data: Array<{ month: string; amount: number }>;
  currency: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const chartWidth = WIDTH - LEFT - RIGHT;
  const chartHeight = HEIGHT - TOP - BOTTOM;
  const max = Math.max(...data.map((item) => item.amount), 1);
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const x = (index: number) => LEFT + (data.length > 1 ? index * step : chartWidth / 2);
  const y = (value: number) => TOP + chartHeight - (value / max) * chartHeight;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const hovered = hover !== null ? data[hover] : null;

  return (
    <div className="relative" style={{ paddingBottom: `calc(${HEIGHT}/${WIDTH}*100%)` }}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="absolute inset-0 w-full h-full"
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={LEFT} x2={WIDTH - RIGHT} y1={y(tick)} y2={y(tick)} stroke="#f1f5f9" />
            <text x={LEFT - 4} y={y(tick) + 4} textAnchor="end" fontSize={10} fill="#94a3b8">
              {compact(tick, currency)}
            </text>
          </g>
        ))}
        <polyline
          fill="none"
          stroke="#6366f1"
          strokeWidth={2}
          points={data.map((item, index) => `${x(index)},${y(item.amount)}`).join(" ")}
        />
        {data.map((item, index) => (
          <circle key={item.month} cx={x(index)} cy={y(item.amount)} r={hover === index ? 4 : 2.5} fill="#6366f1" />
        ))}
        {data.map((item, index) => (
          <rect
            key={`hit-${item.month}`}
            x={x(index) - step / 2}
            y={TOP}
            width={step}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
          />
        ))}
        {data.map((item, index) => (
          <text key={`label-${item.month}`} x={x(index)} y={HEIGHT - 5} textAnchor="middle" fontSize={10} fill="#94a3b8">
            {formatMonth(item.month)}
          </text>
        ))}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={TOP + chartHeight} stroke="#cbd5e1" strokeDasharray="3 2" />
        )}
      </svg>
      {hovered && (
        <div className="absolute top-0 right-0 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs shadow-sm">
          <span className="text-slate-400">{formatMonth(hovered.month, true)}: </span>
          <span className="font-semibold text-slate-800">{formatMoney(hovered.amount, currency)}</span>
        </div>
      )}
    </div>
  );
}
