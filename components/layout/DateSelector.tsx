"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  formatLong,
  formatMonthYear,
  isSameDay,
  isToday,
  monthGrid,
  toKey,
  weekdayLabels,
} from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function DateSelector({
  value,
  onChange,
}: {
  value: Date;
  onChange: (d: Date) => void;
}) {
  const { data } = useApp();
  const mondayStart = data.preferences.weekStartsMonday;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => new Date(value));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const cells = monthGrid(view, mondayStart);
  const labels = weekdayLabels(mondayStart);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setView(new Date(value));
          setOpen((v) => !v);
        }}
        className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
      >
        <CalendarDays size={17} className="text-brand" />
        <span className="hidden sm:inline">{formatLong(value)}</span>
        <span className="sm:hidden">{value.getDate()}</span>
        <ChevronDown size={15} className="text-ink-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-[300px] rounded-2xl border border-line bg-surface p-3 shadow-pop"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <button
                onClick={() => setView(addMonths(view, -1))}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
                aria-label="Previous month"
              >
                <ChevronLeft size={17} />
              </button>
              <div className="text-sm font-semibold text-ink">
                {formatMonthYear(view)}
              </div>
              <button
                onClick={() => setView(addMonths(view, 1))}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft hover:bg-surface-2"
                aria-label="Next month"
              >
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {labels.map((l) => (
                <div
                  key={l}
                  className="grid h-7 place-items-center text-[11px] font-medium text-ink-muted"
                >
                  {l[0]}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                const inMonth = d.getMonth() === view.getMonth();
                const selected = isSameDay(d, value);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onChange(d);
                      setOpen(false);
                    }}
                    className={cn(
                      "grid h-9 place-items-center rounded-lg text-[13px] font-medium transition-colors",
                      !inMonth && "text-ink-muted/50",
                      inMonth && !selected && "text-ink hover:bg-surface-2",
                      selected && "bg-brand text-white",
                      isToday(d) && !selected && "ring-1 ring-brand/40",
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                onChange(new Date());
                setView(new Date());
                setOpen(false);
              }}
              className="mt-2 w-full rounded-lg border border-line py-2 text-sm font-medium text-brand hover:bg-brand-soft"
            >
              Today · {toKey(new Date()) === toKey(value) ? "selected" : "jump"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
