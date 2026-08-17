"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MoodType } from "@/types";
import { findMoodType, getMoodIcon } from "@/lib/mood";

export interface MoodPoint {
  label: string;
  key: string;
  score: number | null; // derived mood value (Y position)
  moodId?: string | null;
}

export function MoodTrendChart({
  points,
  types,
  height = 210,
}: {
  points: MoodPoint[];
  types: MoodType[];
  height?: number;
}) {
  const brand = "rgb(53 184 121)";
  const n = types.length;
  // value → mood type (top of the list has the highest value = n).
  const ticks = types.map((_, i) => n - i);

  const YTick = ({ x, y, payload }: any) => {
    const t = types[n - payload.value];
    if (!t) return null;
    const Icon = getMoodIcon(t.icon);
    return (
      <g transform={`translate(${x - 20},${y - 9})`}>
        <Icon width={18} height={18} color={t.color} />
      </g>
    );
  };

  const MoodTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as MoodPoint;
    if (p.score == null) return null;
    const t = findMoodType(types, p.moodId) ?? types[n - p.score];
    if (!t) return null;
    return (
      <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
        <div className="font-semibold text-ink">{p.label}</div>
        <div className="mt-0.5 flex items-center gap-1.5" style={{ color: t.color }}>
          {(() => {
            const Icon = getMoodIcon(t.icon);
            return <Icon size={13} />;
          })()}
          <span className="font-medium">{t.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 4, left: 24 }}>
          <defs>
            <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={brand} stopOpacity={0.22} />
              <stop offset="100%" stopColor={brand} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgb(var(--line))"
            strokeDasharray="3 6"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgb(var(--ink-muted))", fontSize: 12 }}
            dy={6}
          />
          <YAxis
            type="number"
            domain={[1, Math.max(n, 1)]}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            width={28}
            tick={<YTick />}
          />
          <Tooltip content={<MoodTooltip />} cursor={{ stroke: "rgb(var(--line))" }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke={brand}
            strokeWidth={2.5}
            fill="url(#moodFill)"
            connectNulls
            dot={{ r: 4, fill: brand, strokeWidth: 2, stroke: "rgb(var(--surface))" }}
            activeDot={{ r: 6, fill: brand, strokeWidth: 2, stroke: "rgb(var(--surface))" }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
