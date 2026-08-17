"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CircleCheck, Flame, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { isScheduled } from "@/lib/calculations";
import { daysRemaining, goalPercent, globalStreak } from "@/lib/calculations";
import { todayKey } from "@/lib/dates";

export function NotificationBell() {
  const { data } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const today = todayKey();
  const now = new Date();
  const remaining = data.habits.filter(
    (h) => !h.archived && isScheduled(h, now) && !h.completions.includes(today),
  );
  const dueSoon = data.goals.filter((g) => {
    const d = daysRemaining(g);
    return goalPercent(g) < 100 && d >= 0 && d <= 30;
  });
  const streak = globalStreak(data.habits);
  const count = remaining.length + dueSoon.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <Bell size={19} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-pop"
          >
            <div className="border-b border-line px-4 py-3">
              <div className="text-sm font-semibold text-ink">Notifications</div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              <div className="flex items-start gap-3 rounded-xl px-3 py-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-500/15">
                  <Flame size={16} />
                </span>
                <div className="text-sm">
                  <div className="font-medium text-ink">
                    {streak}-day streak going strong
                  </div>
                  <div className="text-xs text-ink-muted">
                    Keep it alive — consistency compounds.
                  </div>
                </div>
              </div>

              {remaining.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <CircleCheck size={16} />
                  </span>
                  <div className="text-sm">
                    <div className="font-medium text-ink">{h.name} is waiting</div>
                    <div className="text-xs text-ink-muted">
                      Scheduled for today — not done yet.
                    </div>
                  </div>
                </div>
              ))}

              {dueSoon.slice(0, 3).map((g) => (
                <div key={g.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-purple-100 text-purple-500 dark:bg-purple-500/15">
                    <Target size={16} />
                  </span>
                  <div className="text-sm">
                    <div className="font-medium text-ink">{g.title}</div>
                    <div className="text-xs text-ink-muted">
                      {daysRemaining(g)} days left · {goalPercent(g)}% complete
                    </div>
                  </div>
                </div>
              ))}

              {count === 0 && (
                <div className="px-3 py-6 text-center text-sm text-ink-muted">
                  All caught up. Nothing needs you right now. 🌿
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
