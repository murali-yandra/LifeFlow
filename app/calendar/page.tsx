"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Card } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { DaySummary } from "@/components/calendar/DaySummary";
import { findMoodType, getMoodIcon } from "@/lib/mood";
import { dayCompletion, isScheduled } from "@/lib/calculations";
import {
  addMonths,
  diffDays,
  formatMonthYear,
  isToday,
  monthGrid,
  toKey,
  weekdayLabels,
} from "@/lib/dates";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const { data, hydrated } = useApp();
  const [view, setView] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const mondayStart = data.preferences.weekStartsMonday;
  const cells = useMemo(() => monthGrid(view, mondayStart), [view, mondayStart]);
  const labels = weekdayLabels(mondayStart);
  const moodMap = useMemo(
    () => new Map(data.moods.map((m) => [m.date, m.moodId])),
    [data.moods],
  );
  const journalDays = useMemo(
    () => new Set(data.journal.map((j) => j.date.slice(0, 10))),
    [data.journal],
  );

  if (!hydrated) return <PageSkeleton />;

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Every day tells a story of your progress."
        right={
          <span className="hidden sm:block">
            <NotificationBell />
          </span>
        }
      />

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-ink">{formatMonthYear(view)}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView(addMonths(view, -1))}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setView(new Date())}
              className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium text-ink-soft hover:bg-surface-2"
            >
              Today
            </button>
            <button
              onClick={() => setView(addMonths(view, 1))}
              className="grid h-9 w-9 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-t border-line">
          {labels.map((l) => (
            <div
              key={l}
              className="border-b border-line py-2.5 text-center text-[12px] font-medium text-ink-muted"
            >
              <span className="hidden sm:inline">{l}</span>
              <span className="sm:hidden">{l.slice(0, 1)}</span>
            </div>
          ))}

          {cells.map((d, i) => {
            const key = toKey(d);
            const inMonth = d.getMonth() === view.getMonth();
            const future = diffDays(d, new Date()) > 0;
            const scheduled = data.habits.filter(
              (h) => !h.archived && isScheduled(h, d),
            ).length;
            const comp = scheduled > 0 && !future ? dayCompletion(data.habits, d) : 0;
            const md = findMoodType(data.moodTypes, moodMap.get(key));
            const MdIcon = md ? getMoodIcon(md.icon) : null;
            const hasJournal = journalDays.has(key);
            const today = isToday(d);

            return (
              <motion.button
                key={i}
                onClick={() => inMonth && setSelected(d)}
                disabled={!inMonth}
                initial={{ opacity: 0 }}
                animate={{ opacity: inMonth ? 1 : 0.35 }}
                transition={{ delay: Math.min(i * 0.006, 0.2) }}
                className={cn(
                  "group relative flex min-h-[76px] flex-col border-b border-r border-line p-1.5 text-left transition-colors sm:min-h-[104px] sm:p-2.5",
                  inMonth ? "hover:bg-surface-2" : "pointer-events-none",
                  (i + 1) % 7 === 0 && "border-r-0",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-[12.5px] font-semibold tabular-nums",
                      today ? "bg-brand text-white" : "text-ink-soft",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <div className="flex items-center gap-1">
                    {hasJournal && (
                      <NotebookPen size={12} className="text-ink-muted" />
                    )}
                    {md && MdIcon && <MdIcon size={14} color={md.color} />}
                  </div>
                </div>

                {scheduled > 0 && !future && (
                  <div className="mt-auto">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${Math.round(comp * 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 hidden text-[10px] text-ink-muted sm:block">
                      {Math.round(comp * 100)}% done
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-6 rounded-full bg-brand" /> Habit completion
        </span>
        <span className="flex items-center gap-1.5">
          {(() => {
            const g = data.moodTypes[0];
            if (!g) return null;
            const Icon = getMoodIcon(g.icon);
            return <Icon size={14} color={g.color} />;
          })()}{" "}
          Mood logged
        </span>
        <span className="flex items-center gap-1.5">
          <NotebookPen size={13} /> Journal entry
        </span>
      </div>

      <DaySummary
        date={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
