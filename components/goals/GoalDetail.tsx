"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Flag, Minus, Plus } from "lucide-react";
import type { Goal } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import { goalPercent, daysRemaining } from "@/lib/calculations";
import { formatGoalValue } from "@/lib/utils";
import { formatLong, fromKey } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function GoalDetail({
  goal,
  open,
  onClose,
}: {
  goal: Goal | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, setGoalProgress } = useApp();
  const [input, setInput] = useState("");

  if (!goal) return null;
  const live = data.goals.find((g) => g.id === goal.id) ?? goal;
  const a = accent(live.color);
  const Icon = getIcon(live.icon);
  const pct = goalPercent(live);
  const remaining = daysRemaining(live);
  const step = Math.max(1, Math.round(live.target / 20));

  const setTo = (v: number) => setGoalProgress(live.id, v);

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
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-ink">
              {live.title}
            </h2>
            {live.description && (
              <p className="text-sm text-ink-soft">{live.description}</p>
            )}
          </div>
        </div>

        {/* Progress hero */}
        <div className="mt-5 rounded-2xl border border-line p-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold text-ink">
                {formatGoalValue(live.current, live.unit, live.unitPrefix)}
                <span className="text-lg font-medium text-ink-muted">
                  {" / "}
                  {formatGoalValue(live.target, live.unit, live.unitPrefix)}
                </span>
              </div>
              <div className="mt-1 text-sm text-ink-soft">
                {remaining >= 0
                  ? `${remaining} days left · due ${formatLong(fromKey(live.deadline.slice(0, 10)))}`
                  : "Past deadline"}
              </div>
            </div>
            <div className="text-3xl font-bold tabular-nums" style={{ color: a.base }}>
              {pct}%
            </div>
          </div>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: a.base }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTo(live.current - step)}
              disabled={live.current <= 0}
              className="grid h-9 w-9 place-items-center rounded-xl border border-line text-ink-soft hover:bg-surface-2 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={() => setTo(live.current + step)}
              disabled={pct >= 100}
              className="grid h-9 w-9 place-items-center rounded-xl text-white disabled:opacity-40"
              style={{ backgroundColor: a.base }}
            >
              <Plus size={16} />
            </button>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Set value"
                className="h-9 w-28"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const v = Number(input);
                  if (!Number.isNaN(v)) setTo(v);
                  setInput("");
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-ink">Milestones</h3>
          <div className="space-y-2">
            {live.milestones.map((m) => {
              const reached = pct >= m.percent;
              return (
                <motion.div
                  key={m.id}
                  animate={reached ? { scale: [1, 1.015, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                    reached ? "border-transparent" : "border-line",
                  )}
                  style={reached ? { backgroundColor: a.soft } : undefined}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                      reached ? "text-white" : "border border-line text-ink-muted",
                    )}
                    style={reached ? { backgroundColor: a.base } : undefined}
                  >
                    {reached ? <Check size={16} strokeWidth={3} /> : <Flag size={14} />}
                  </span>
                  <div className="flex-1">
                    <div
                      className="text-sm font-medium"
                      style={{ color: reached ? a.base : "rgb(var(--ink))" }}
                    >
                      {m.label}
                    </div>
                    <div className="text-xs text-ink-muted">{m.percent}% of goal</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        {live.history.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">Activity</h3>
            <div className="space-y-2">
              {[...live.history]
                .slice(-6)
                .reverse()
                .map((h, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.base }} />
                    <span className="text-ink-soft">
                      {formatLong(fromKey(h.date))}
                    </span>
                    <span className="ml-auto font-medium text-ink">
                      {formatGoalValue(h.value, live.unit, live.unitPrefix)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
