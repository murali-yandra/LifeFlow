"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Habit } from "@/types";
import { Card } from "@/components/ui/Card";
import { getIcon } from "@/lib/icons";
import { accentBase } from "@/lib/palette";
import { isScheduled } from "@/lib/calculations";
import { HabitTrackerModal } from "@/components/habits/HabitTrackerModal";
import { addDays, diffDays, isSameDay, isToday, toKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

const WINDOW_BEFORE = 6;
const WINDOW_AFTER = 4;
const COLS = WINDOW_BEFORE + WINDOW_AFTER + 1;

export function HabitGrid({
  habits,
  selectedDate,
  onToggle,
}: {
  habits: Habit[];
  selectedDate: Date;
  onToggle: (habitId: string, dateKey: string) => void;
}) {
  const [full, setFull] = useState(false);
  const active = habits.filter((h) => !h.archived);
  const days = Array.from(
    { length: COLS },
    (_, i) => addDays(selectedDate, i - WINDOW_BEFORE),
  );

  const title = isToday(selectedDate)
    ? `Today · ${monthDay(selectedDate)}`
    : monthDay(selectedDate);

  const doneToday = active.filter((h) =>
    h.completions.includes(toKey(selectedDate)),
  ).length;
  const scheduledToday = active.filter((h) => isScheduled(h, selectedDate)).length;

  return (
    <Card padded={false} className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-3 pt-5 sm:px-6">
        <div>
          <h3 className="text-[17px] font-semibold tracking-tight text-ink">
            {title}
          </h3>
          <span className="text-[12px] text-ink-muted">
            {doneToday}/{scheduledToday} completed
          </span>
        </div>
        <button
          onClick={() => setFull(true)}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
        >
          Full View <ArrowRight size={13} />
        </button>
      </div>

      <div className="no-scrollbar overflow-x-auto px-5 pb-5 sm:px-6">
        <div className="min-w-[440px]">
          {/* Sticky day header */}
          <div
            className="sticky top-0 z-10 mb-1.5 grid items-center gap-1 bg-surface pb-1"
            style={{ gridTemplateColumns: `132px repeat(${COLS}, minmax(0,1fr))` }}
          >
            <div />
            {days.map((d) => {
              const sel = isSameDay(d, selectedDate);
              return (
                <div key={toKey(d)} className="grid place-items-center">
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full text-[12.5px] font-semibold tabular-nums",
                      sel ? "bg-brand-soft text-brand" : "text-ink-muted",
                    )}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Scrollable habit rows (≈6 visible) */}
          <div className="no-scrollbar max-h-[264px] space-y-0.5 overflow-y-auto">
            {active.map((habit) => {
              const color = accentBase(habit.color);
              const Icon = getIcon(habit.icon);
              return (
                <div
                  key={habit.id}
                  className="grid items-center gap-1 py-1"
                  style={{ gridTemplateColumns: `132px repeat(${COLS}, minmax(0,1fr))` }}
                >
                  <div className="flex items-center gap-2 pr-2">
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                      style={{ backgroundColor: `${color}1f`, color }}
                    >
                      <Icon size={13} />
                    </span>
                    <span className="truncate text-[13px] font-medium text-ink-soft">
                      {habit.name}
                    </span>
                  </div>

                  {days.map((d) => {
                    const key = toKey(d);
                    const scheduled = isScheduled(habit, d);
                    const done = habit.completions.includes(key);
                    const future = diffDays(d, new Date()) > 0;
                    const disabled = future;
                    return (
                      <div key={key} className="grid place-items-center">
                        <button
                          onClick={() => !disabled && onToggle(habit.id, key)}
                          disabled={disabled}
                          aria-label={`${habit.name} ${key} ${done ? "completed" : "not completed"}`}
                          title={`${habit.name} · ${key}`}
                          className={cn(
                            "h-[22px] w-[22px] rounded-[6px] border transition-all",
                            done && "border-transparent",
                            !done && !disabled && "border-line hover:border-ink-muted hover:bg-surface-2",
                            !done && !scheduled && "opacity-45",
                            future && "cursor-default opacity-40",
                          )}
                          style={{ backgroundColor: done ? color : "transparent" }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <HabitTrackerModal
        open={full}
        onClose={() => setFull(false)}
        initialView="grid"
      />
    </Card>
  );
}

function monthDay(d: Date): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
