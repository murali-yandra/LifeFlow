"use client";

import { motion } from "framer-motion";
import { Check, Flame, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Habit } from "@/types";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import { habitStats, isScheduled } from "@/lib/calculations";
import { frequencyLabel } from "@/lib/frequency";
import { todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function HabitCard({
  habit,
  index,
  onToggle,
  onEdit,
  onDelete,
  onOpen,
}: {
  habit: Habit;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const a = accent(habit.color);
  const Icon = getIcon(habit.icon);
  const stats = habitStats(habit);
  const today = todayKey();
  const doneToday = habit.completions.includes(today);
  const scheduledToday = isScheduled(habit, new Date());
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onOpen}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform hover:scale-105"
          style={{ backgroundColor: a.soft, color: a.base }}
          aria-label={`Open ${habit.name}`}
        >
          <Icon size={21} />
        </button>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-[15px] font-semibold text-ink">
            {habit.name}
          </h3>
          <p className="truncate text-[13px] text-ink-muted">
            {habit.description || frequencyLabel(habit.frequency)}
          </p>
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted opacity-0 transition-all hover:bg-surface-2 hover:text-ink group-hover:opacity-100"
            aria-label="Habit options"
          >
            <MoreVertical size={17} />
          </button>
          {menu && (
            <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop">
              <button
                onClick={() => {
                  setMenu(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-soft hover:bg-surface-2"
              >
                <Pencil size={15} /> Edit
              </button>
              <button
                onClick={() => {
                  setMenu(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Streak" value={`${stats.current}`} accent icon />
        <Stat label="Best" value={`${stats.best}`} />
        <Stat label="Rate" value={`${stats.completionRate}%`} />
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: a.base }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Today toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "mt-4 flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all active:scale-[0.98]",
          doneToday
            ? "text-white"
            : "border border-line text-ink-soft hover:bg-surface-2",
        )}
        style={doneToday ? { backgroundColor: a.base } : undefined}
      >
        {doneToday ? (
          <>
            <Check size={16} strokeWidth={3} /> Completed today
          </>
        ) : scheduledToday ? (
          "Mark done today"
        ) : (
          "Not scheduled today"
        )}
      </button>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  accent: isAccent,
  icon,
}: {
  label: string;
  value: string;
  accent?: boolean;
  icon?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface-2/60 py-2">
      <div
        className={cn(
          "flex items-center justify-center gap-1 text-[15px] font-bold tabular-nums",
          isAccent ? "text-brand" : "text-ink",
        )}
      >
        {icon && <Flame size={13} className="text-orange-500" />}
        {value}
      </div>
      <div className="text-[11px] text-ink-muted">{label}</div>
    </div>
  );
}
