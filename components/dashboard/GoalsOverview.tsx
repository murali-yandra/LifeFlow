"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Goal } from "@/types";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/Progress";
import { EmptyState } from "@/components/ui/Empty";
import { Target } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import { goalPercent, overallGoalProgress } from "@/lib/calculations";
import { formatGoalValue } from "@/lib/utils";

export function GoalsOverview({ goals }: { goals: Goal[] }) {
  const top = goals.slice(0, 3);
  const overall = overallGoalProgress(goals);

  return (
    <Card>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[17px] font-semibold tracking-tight text-ink">
          Goals Overview
        </h3>
        <Link
          href="/goals"
          className="text-[13px] font-medium text-brand hover:underline"
        >
          View All
        </Link>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Set a goal to see your overall progress take shape."
          action={
            <Link
              href="/goals"
              className="text-sm font-medium text-brand hover:underline"
            >
              Create a goal
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <div className="w-full flex-1 space-y-2.5">
            {top.map((g, i) => {
              const a = accent(g.color);
              const Icon = getIcon(g.icon);
              const pct = goalPercent(g);
              return (
                <Link key={g.id} href="/goals" className="block">
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-line bg-surface p-3 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: a.soft, color: a.base }}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 truncate text-sm font-medium text-ink">
                        {g.title}
                      </span>
                      <span className="text-[13px] font-semibold text-ink-soft tabular-nums">
                        {formatGoalValue(g.current, g.unit, g.unitPrefix)}
                        <span className="text-ink-muted">
                          {" "}
                          / {formatGoalValue(g.target, g.unit, g.unitPrefix)}
                        </span>
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: a.base }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="shrink-0">
            <ProgressRing value={overall} size={128} stroke={11}>
              <div>
                <div className="text-2xl font-bold leading-none text-ink">
                  {overall}%
                </div>
                <div className="mt-1 text-[11px] font-medium text-ink-muted">
                  Overall Progress
                </div>
              </div>
            </ProgressRing>
          </div>
        </div>
      )}
    </Card>
  );
}
