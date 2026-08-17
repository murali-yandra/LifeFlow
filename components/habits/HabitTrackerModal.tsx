"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Radar,
  X,
} from "lucide-react";
import type { Habit } from "@/types";
import { RadialTracker } from "./RadialTracker";
import { GridTracker } from "./GridTracker";
import { useApp } from "@/context/AppContext";
import { accentBase } from "@/lib/palette";
import { isScheduled } from "@/lib/calculations";
import { addMonths, diffDays, formatMonthYear, toKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

type View = "radial" | "grid";

export function HabitTrackerModal({
  open,
  onClose,
  initialView = "radial",
  initialMonth,
}: {
  open: boolean;
  onClose: () => void;
  initialView?: View;
  initialMonth?: Date;
}) {
  const { data, toggleCompletion } = useApp();
  const [view, setView] = useState<View>(initialView);
  const [month, setMonth] = useState(() => initialMonth ?? new Date());

  useEffect(() => {
    if (open) setView(initialView);
  }, [open, initialView]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const habits = useMemo(() => data.habits.filter((h) => !h.archived), [data.habits]);

  const { pct, done, total } = useMemo(() => {
    const year = month.getFullYear();
    const mon = month.getMonth();
    const numDays = new Date(year, mon + 1, 0).getDate();
    const today = new Date();
    let d = 0;
    let t = 0;
    for (const h of habits) {
      const set = new Set(h.completions);
      for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, mon, day);
        if (diffDays(date, today) > 0) continue;
        if (!isScheduled(h, date)) continue;
        t++;
        if (set.has(toKey(date))) d++;
      }
    }
    return { pct: t ? Math.round((d / t) * 100) : 0, done: d, total: t };
  }, [habits, month]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 flex h-full w-full max-w-5xl flex-col overflow-hidden border-line bg-canvas shadow-pop sm:h-auto sm:max-h-[92vh] sm:rounded-3xl sm:border"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  Habit Progress
                </h2>
                <p className="text-sm text-ink-soft">
                  {habits.length} habits · track your consistency
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Month switcher */}
                <div className="flex items-center gap-1 rounded-xl border border-line p-0.5">
                  <button
                    onClick={() => setMonth(addMonths(month, -1))}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="min-w-[112px] text-center text-[13px] font-semibold text-ink">
                    {formatMonthYear(month)}
                  </span>
                  <button
                    onClick={() => setMonth(addMonths(month, 1))}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* View toggle */}
                <div className="flex items-center rounded-xl border border-line p-0.5">
                  <ToggleBtn active={view === "radial"} onClick={() => setView("radial")}>
                    <Radar size={15} /> Radial
                  </ToggleBtn>
                  <ToggleBtn active={view === "grid"} onClick={() => setView("grid")}>
                    <LayoutGrid size={15} /> Grid
                  </ToggleBtn>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-surface-2 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {view === "radial" ? (
                  <motion.div
                    key="radial"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <p className="text-center text-xs text-ink-muted">
                      Each ring is a habit · each slice is a day · scroll to explore
                      more habits
                    </p>
                    <div className="w-full max-w-[600px]">
                      <RadialTracker
                        habits={habits}
                        month={month}
                        size={600}
                        onToggle={toggleCompletion}
                        center={
                          <div>
                            <div className="text-3xl font-bold leading-none text-ink">
                              {pct}%
                            </div>
                            <div className="mt-1 text-[11px] font-medium text-ink-muted">
                              Completed
                            </div>
                            <div className="mt-0.5 text-[10px] text-ink-muted">
                              {done}/{total} habit-days
                            </div>
                          </div>
                        }
                      />
                    </div>
                    <Legend habits={habits} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <GridTracker
                      habits={habits}
                      month={month}
                      onToggle={toggleCompletion}
                    />
                  </motion.div>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "bg-brand text-white" : "text-ink-soft hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

function Legend({ habits }: { habits: Habit[] }) {
  return (
    <div className="flex max-w-2xl flex-wrap justify-center gap-x-4 gap-y-1.5">
      {habits.map((h) => (
        <span key={h.id} className="flex items-center gap-1.5 text-[12px] text-ink-soft">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accentBase(h.color) }}
          />
          {h.name}
        </span>
      ))}
    </div>
  );
}
