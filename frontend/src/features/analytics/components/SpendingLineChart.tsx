"use client";

import { useState } from "react";

const DATA = [
  { month: "Feb", bali: 0, apartment: 420, ski: 0 },
  { month: "Mar", bali: 0, apartment: 380, ski: 1240 },
  { month: "Apr", bali: 0, apartment: 410, ski: 220 },
  { month: "May", bali: 0, apartment: 455, ski: 0 },
  { month: "Jun", bali: 0, apartment: 390, ski: 0 },
  { month: "Jul", bali: 1245, apartment: 445, ski: 0 },
];
const LINES = [
  { key: "bali", color: "#10b981" },
  { key: "apartment", color: "#6366f1" },
  { key: "ski", color: "#f59e0b" },
] as const;

export default function SpendingLineChart() {
  const [hover, setHover] = useState<number | null>(null);
  const width = 560,
    height = 200,
    left = 44,
    right = 10,
    top = 8,
    bottom = 24;
  const chartWidth = width - left - right,
    chartHeight = height - top - bottom,
    max = 1245;
  const x = (index: number) => left + (index / (DATA.length - 1)) * chartWidth;
  const y = (value: number) => top + chartHeight - (value / max) * chartHeight;
  return (
    <div className="relative" style={{ paddingBottom: "calc(200/560*100%)" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 w-full h-full"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 311, 623, 934, 1245].map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#f1f5f9"
            />
            <text
              x={left - 4}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize={10}
              fill="#94a3b8"
            >
              ${tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
            </text>
          </g>
        ))}
        {LINES.map(({ key, color }) => (
          <polyline
            key={key}
            fill="none"
            stroke={color}
            strokeWidth={2}
            points={DATA.map(
              (item, index) => `${x(index)},${y(item[key])}`,
            ).join(" ")}
          />
        ))}
        {DATA.map((_, index) => (
          <rect
            key={index}
            x={x(index) - chartWidth / (DATA.length - 1) / 2}
            y={top}
            width={chartWidth / (DATA.length - 1)}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
          />
        ))}
        {DATA.map((item, index) => (
          <text
            key={item.month}
            x={x(index)}
            y={height - 5}
            textAnchor="middle"
            fontSize={10}
            fill="#94a3b8"
          >
            {item.month}
          </text>
        ))}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={top}
            y2={top + chartHeight}
            stroke="#cbd5e1"
            strokeDasharray="3 2"
          />
        )}
      </svg>
    </div>
  );
}
