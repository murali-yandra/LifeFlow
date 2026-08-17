"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface BarPoint {
  label: string;
  value: number;
}

function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as BarPoint;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <div className="font-semibold text-ink">{p.label}</div>
      <div className="text-ink-soft">{p.value}% completion</div>
    </div>
  );
}

export function WeeklyBars({ points }: { points: BarPoint[] }) {
  const brand = "rgb(53 184 121)";
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
          <CartesianGrid vertical={false} stroke="rgb(var(--line))" strokeDasharray="3 6" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgb(var(--ink-muted))", fontSize: 12 }}
            dy={6}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgb(var(--ink-muted))", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "rgb(var(--surface-2))" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={800}>
            {points.map((p, i) => (
              <Cell
                key={i}
                fill={brand}
                fillOpacity={0.35 + (p.value / 100) * 0.65}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
