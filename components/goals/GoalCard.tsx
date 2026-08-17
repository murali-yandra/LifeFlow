"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Minus, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { Goal } from "@/types";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import { goalPercent, daysRemaining } from "@/lib/calculations";
import { formatGoalValue } from "@/lib/utils";
import { formatLong, fromKey } from "@/lib/dates";
import { Confetti } from "@/components/ui/Confetti";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<Goal["category"], string> = {
  short: "Short-term",
  monthly: "Monthly",
  long: "Long-term",
};

export function GoalCard({
  goal,
  index,
  onStep,
  onEdit,
  onDelete,
  onOpen,
}: {
  goal: Goal;
  index: number;
  onStep: (delta: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  const a = accent(goal.color);
  const Icon = getIcon(goal.icon);
  const pct = goalPercent(goal);
  const done = pct >= 100;
  const remaining = daysRemaining(goal);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [fire, setFire] = useState(false);
  const prevPct = useRef(pct);

  useEffect(() => {
    if (prevPct.current < 100 && pct >= 100) setFire(true);
    else if (fire && pct >= 100) {
      /* keep */
    } else setFire(false);
    prevPct.current = pct;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const step = Math.max(1, Math.round(goal.target / 20));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      className="relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <Confetti fire={fire} />

      <div className="flex items-start gap-3">
        <button
          onClick={onOpen}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform hover:scale-105"
          style={{ backgroundColor: a.soft, color: a.base }}
        >
          <Icon size={21} />
        </button>
        <button onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-ink">
              {goal.title}
            </h3>
            {done && <CheckCircle2 size={16} className="shrink-0 text-brand" />}
          </div>
          <span
            className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: a.soft, color: a.base }}
          >
            {CATEGORY_LABEL[goal.category]}
          </span>
        </button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            aria-label="Goal options"
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

      {/* Progress numbers */}
      <div className="mt-4 flex items-end justify-between">
        <div className="text-[15px] font-semibold text-ink">
          {formatGoalValue(goal.current, goal.unit, goal.unitPrefix)}
          <span className="text-ink-muted">
            {" / "}
            {formatGoalValue(goal.target, goal.unit, goal.unitPrefix)}
          </span>
        </div>
        <div className="text-lg font-bold tabular-nums" style={{ color: a.base }}>
          {pct}%
        </div>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: a.base }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-ink-muted">
          {done
            ? "Achieved 🎉"
            : remaining >= 0
              ? `${remaining} days left · ${formatLong(fromKey(goal.deadline.slice(0, 10)))}`
              : "Past deadline"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onStep(-step)}
            disabled={goal.current <= 0}
            className="grid h-7 w-7 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-surface-2 disabled:opacity-40"
            aria-label="Decrease progress"
          >
            <Minus size={15} />
          </button>
          <button
            onClick={() => onStep(step)}
            disabled={done}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-lg text-white transition-colors disabled:opacity-40",
            )}
            style={{ backgroundColor: a.base }}
            aria-label="Increase progress"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
