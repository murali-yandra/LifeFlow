"use client";

import type { Habit } from "@/types";
import { getIcon } from "@/lib/icons";
import { accentBase } from "@/lib/palette";
import { isScheduled } from "@/lib/calculations";
import { diffDays, toKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * Rectangular habit × day grid (square cells), inspired by a paper habit
 * tracker. Habit-name column and day header stay sticky while the grid scrolls.
 */
export function GridTracker({
  habits,
  month,
  onToggle,
  cell = 30,
}: {
  habits: Habit[];
  month: Date;
  onToggle: (habitId: string, dateKey: string) => void;
  cell?: number;
}) {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const numDays = new Date(year, mon + 1, 0).getDate();
  const today = new Date();
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  return (
    <div className="no-scrollbar overflow-auto rounded-2xl border border-line">
      <div className="inline-block min-w-full">
        {/* Header row */}
        <div className="flex">
          <div className="sticky left-0 top-0 z-30 flex w-[190px] shrink-0 items-center border-b border-r border-line bg-surface px-3 py-2 text-[12px] font-semibold text-ink-soft">
            Habit
          </div>
          <div className="sticky top-0 z-20 flex bg-surface">
            {days.map((d) => {
              const isToday = toKey(new Date(year, mon, d)) === toKey(today);
              return (
                <div
                  key={d}
                  className="grid shrink-0 place-items-center border-b border-r border-line text-[11px] font-medium tabular-nums"
                  style={{ width: cell, height: 34 }}
                >
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full",
                      isToday ? "bg-brand text-white" : "text-ink-muted",
                    )}
                  >
                    {d}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit rows */}
        {habits.map((habit) => {
          const color = accentBase(habit.color);
          const Icon = getIcon(habit.icon);
          const completed = new Set(habit.completions);
          return (
            <div key={habit.id} className="flex">
              <div className="sticky left-0 z-10 flex w-[190px] shrink-0 items-center gap-2 border-b border-r border-line bg-surface px-3 py-1.5">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                  style={{ backgroundColor: `${color}22`, color }}
                >
                  <Icon size={13} />
                </span>
                <span className="truncate text-[12.5px] font-medium text-ink" title={habit.name}>
                  {habit.name}
                </span>
              </div>
              <div className="flex">
                {days.map((d) => {
                  const date = new Date(year, mon, d);
                  const key = toKey(date);
                  const done = completed.has(key);
                  const future = diffDays(date, today) > 0;
                  const scheduled = isScheduled(habit, date);
                  return (
                    <div
                      key={d}
                      className="shrink-0 border-b border-r border-line"
                      style={{ width: cell, height: cell }}
                    >
                      <button
                        disabled={future}
                        onClick={() => onToggle(habit.id, key)}
                        title={`${habit.name} · ${key}${done ? " · done" : ""}`}
                        aria-label={`${habit.name} ${key} ${done ? "completed" : "not completed"}`}
                        className={cn(
                          "block h-full w-full transition-colors",
                          !done && !future && "hover:bg-surface-2",
                          !done && !scheduled && "opacity-40",
                          future && "cursor-default opacity-40",
                        )}
                        style={{ backgroundColor: done ? color : "transparent" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
