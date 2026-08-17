"use client";

import type { Habit } from "@/types";
import { dayCompletion } from "@/lib/calculations";
import { addDays, diffDays, monthName, toKey } from "@/lib/dates";

/**
 * GitHub-style year heatmap of overall daily habit completion.
 * Greener = higher completion. Scrolls horizontally on small screens.
 */
export function YearHeatmap({ habits }: { habits: Habit[] }) {
  const end = new Date();
  const start = addDays(end, -363);
  // Align start to the beginning of its week (Sunday).
  const alignedStart = addDays(start, -start.getDay());

  const weeks: Date[][] = [];
  let cur = new Date(alignedStart);
  while (diffDays(cur, end) <= 0) {
    const col: Date[] = [];
    for (let d = 0; d < 7; d++) {
      col.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    weeks.push(col);
  }

  const color = (frac: number, future: boolean) => {
    if (future) return "rgb(var(--surface-2))";
    if (frac <= 0) return "rgb(var(--surface-2))";
    const op = 0.25 + frac * 0.75;
    return `rgba(53,184,121,${op})`;
  };

  // Month labels above columns.
  const monthMarks: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((col, i) => {
    const m = col[0].getMonth();
    if (m !== lastMonth) {
      monthMarks.push({ index: i, label: monthName(col[0]).slice(0, 3) });
      lastMonth = m;
    }
  });

  return (
    <div className="no-scrollbar overflow-x-auto pb-1">
      <div className="min-w-[720px]">
        <div className="mb-1 flex gap-[3px] pl-0 text-[10px] text-ink-muted">
          {weeks.map((_, i) => {
            const mark = monthMarks.find((m) => m.index === i);
            return (
              <div key={i} className="w-[13px]">
                {mark ? mark.label : ""}
              </div>
            );
          })}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {col.map((d, di) => {
                const future = diffDays(d, end) > 0;
                const frac = future ? 0 : dayCompletion(habits, d);
                return (
                  <div
                    key={di}
                    title={`${toKey(d)} · ${Math.round(frac * 100)}%`}
                    className="h-[13px] w-[13px] rounded-[3px]"
                    style={{ backgroundColor: color(frac, future) }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-muted">
          Less
          {[0, 0.3, 0.55, 0.8, 1].map((f, i) => (
            <span
              key={i}
              className="h-[11px] w-[11px] rounded-[3px]"
              style={{ backgroundColor: color(f, false) }}
            />
          ))}
          More
        </div>
      </div>
    </div>
  );
}
