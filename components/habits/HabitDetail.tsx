"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Habit } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import { habitStats, isScheduled } from "@/lib/calculations";
import { frequencyLabel } from "@/lib/frequency";
import {
  addDays,
  addMonths,
  diffDays,
  formatMonthYear,
  isToday,
  monthGrid,
  toKey,
  weekdayLabels,
} from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function HabitDetail({
  habit,
  open,
  onClose,
}: {
  habit: Habit | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, toggleCompletion } = useApp();
  const [view, setView] = useState(() => new Date());

  if (!habit) return null;
  // Read the live habit so toggles reflect immediately.
  const live = data.habits.find((h) => h.id === habit.id) ?? habit;
  const a = accent(live.color);
  const Icon = getIcon(live.icon);
  const stats = habitStats(live);
  const cells = monthGrid(view, data.preferences.weekStartsMonday);
  const labels = weekdayLabels(data.preferences.weekStartsMonday);
  const completed = new Set(live.completions);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="-mt-1">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ backgroundColor: a.soft, color: a.base }}
          >
            <Icon size={24} />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">
              {live.name}
            </h2>
            <p className="text-sm text-ink-soft">
              {live.description || frequencyLabel(live.frequency)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Current Streak" value={`${stats.current}`} suffix="days" tint={a.base} />
          <Tile label="Best Streak" value={`${stats.best}`} suffix="days" />
          <Tile label="Completion" value={`${stats.completionRate}%`} />
          <Tile label="Total Done" value={`${stats.totalCompleted}`} />
        </div>

        {/* Calendar */}
        <div className="mt-6 rounded-2xl border border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-ink">
              {formatMonthYear(view)}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setView(addMonths(view, -1))}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setView(addMonths(view, 1))}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1.5">
            {labels.map((l) => (
              <div key={l} className="grid place-items-center text-[11px] font-medium text-ink-muted">
                {l[0]}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              const key = toKey(d);
              const inMonth = d.getMonth() === view.getMonth();
              const done = completed.has(key);
              const scheduled = isScheduled(live, d);
              const future = diffDays(d, new Date()) > 0;
              return (
                <button
                  key={i}
                  disabled={!inMonth || future || !scheduled}
                  onClick={() => toggleCompletion(live.id, key)}
                  className={cn(
                    "grid aspect-square place-items-center rounded-lg text-[12px] font-medium transition-all",
                    !inMonth && "opacity-0 pointer-events-none",
                    done && "text-white",
                    !done && scheduled && !future && "border border-line text-ink-soft hover:bg-surface-2",
                    !done && (!scheduled || future) && "text-ink-muted/40",
                    isToday(d) && !done && "ring-1 ring-brand/50",
                  )}
                  style={done ? { backgroundColor: a.base } : undefined}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* 12-week heatmap */}
        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold text-ink">Last 12 weeks</div>
          <HeatStrip habit={live} color={a.base} />
        </div>
      </div>
    </Modal>
  );
}

function Tile({
  label,
  value,
  suffix,
  tint,
}: {
  label: string;
  value: string;
  suffix?: string;
  tint?: string;
}) {
  return (
    <div className="rounded-xl bg-surface-2/60 p-3 text-center">
      <div
        className="text-xl font-bold tabular-nums"
        style={{ color: tint ?? "rgb(var(--ink))" }}
      >
        {value}
      </div>
      <div className="text-[11px] text-ink-muted">
        {label}
        {suffix ? ` · ${suffix}` : ""}
      </div>
    </div>
  );
}

function HeatStrip({ habit, color }: { habit: Habit; color: string }) {
  const completed = new Set(habit.completions);
  const end = new Date();
  // 12 weeks × 7 days ending today, aligned to weeks.
  const start = addDays(end, -(12 * 7 - 1));
  const cols: Date[][] = [];
  let cur = new Date(start);
  // back up to Sunday
  cur = addDays(cur, -cur.getDay());
  for (let w = 0; w < 13; w++) {
    const col: Date[] = [];
    for (let d = 0; d < 7; d++) {
      col.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    cols.push(col);
  }
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto">
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-1">
          {col.map((d, di) => {
            const key = toKey(d);
            const future = diffDays(d, end) > 0;
            const scheduled = isScheduled(habit, d);
            const done = completed.has(key);
            return (
              <div
                key={di}
                title={`${key}${done ? " · done" : ""}`}
                className="h-3.5 w-3.5 rounded-[3px]"
                style={{
                  backgroundColor: done
                    ? color
                    : "rgb(var(--surface-2))",
                  opacity: future ? 0.25 : !scheduled ? 0.4 : 1,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
