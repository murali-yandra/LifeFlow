"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MoodEntry } from "@/types";
import { Card } from "@/components/ui/Card";
import { mood as moodDef } from "@/lib/mood";
import {
  addMonths,
  diffDays,
  formatMonthYear,
  isSameDay,
  monthGrid,
  toKey,
  weekdayLabels,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

export function MoodCalendar({
  moods,
  weekStartsMonday,
  selected,
  onSelect,
}: {
  moods: MoodEntry[];
  weekStartsMonday: boolean;
  selected: Date;
  onSelect: (d: Date) => void;
}) {
  const [view, setView] = useState(() => new Date(selected));
  const cells = monthGrid(view, weekStartsMonday);
  const labels = weekdayLabels(weekStartsMonday);
  const map = new Map(moods.map((m) => [m.date, m.mood]));

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[17px] font-semibold tracking-tight text-ink">
          Mood Calendar
        </h3>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-sm font-medium text-ink-soft">
            {formatMonthYear(view)}
          </span>
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

      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {labels.map((l) => (
          <div key={l} className="grid place-items-center text-[11px] font-medium text-ink-muted">
            {l.slice(0, 2)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, i) => {
          const key = toKey(d);
          const inMonth = d.getMonth() === view.getMonth();
          const score = map.get(key);
          const def = score ? moodDef(score) : null;
          const future = diffDays(d, new Date()) > 0;
          const sel = isSameDay(d, selected);
          return (
            <button
              key={i}
              disabled={!inMonth || future}
              onClick={() => onSelect(d)}
              className={cn(
                "grid aspect-square place-items-center rounded-xl border text-[12px] font-medium transition-all",
                !inMonth && "opacity-0 pointer-events-none",
                sel ? "border-brand ring-1 ring-brand/40" : "border-transparent",
                !def && !future && "bg-surface-2/50 text-ink-muted hover:bg-surface-2",
                future && "text-ink-muted/40",
              )}
              style={def ? { backgroundColor: def.soft } : undefined}
            >
              {def ? (
                <def.icon size={18} color={def.color} />
              ) : (
                d.getDate()
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
