"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { Habit } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { RadialTracker } from "@/components/habits/RadialTracker";
import { HabitTrackerModal } from "@/components/habits/HabitTrackerModal";
import { EmptyState } from "@/components/ui/Empty";
import { Sprout } from "lucide-react";
import { accentBase } from "@/lib/palette";
import { rateInRange } from "@/lib/calculations";
import { addDays, startOfMonth } from "@/lib/dates";

type Period = "week" | "month" | "year";
const PREVIEW_COUNT = 5;

export function HabitProgress({ habits }: { habits: Habit[] }) {
  const [period, setPeriod] = useState<Period>("month");
  const [modalOpen, setModalOpen] = useState(false);

  const active = habits.filter((h) => !h.archived);

  const ranked = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (period === "week") start = addDays(now, -6);
    else if (period === "month") start = startOfMonth(now);
    else start = new Date(now.getFullYear(), 0, 1);
    return active
      .map((h) => ({ habit: h, value: rateInRange(h, start, now) }))
      .sort((a, b) => b.value - a.value);
  }, [active, period]);

  const top = ranked.slice(0, PREVIEW_COUNT);
  const overall = top.length
    ? Math.round(top.reduce((s, r) => s + r.value, 0) / top.length)
    : 0;

  return (
    <Card>
      <CardHeader
        title="Habit Progress"
        action={
          <Dropdown<Period>
            value={period}
            onChange={setPeriod}
            options={[
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "year", label: "This Year" },
            ]}
          />
        }
      />

      {active.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No habits yet"
          description="Create a habit to see your radial progress bloom."
        />
      ) : (
        <>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Top-5 legend */}
            <div className="order-2 flex-1 sm:order-1">
              <div className="space-y-1.5">
                {top.map(({ habit, value }) => (
                  <div key={habit.id} className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accentBase(habit.color) }}
                    />
                    <span className="flex-1 truncate text-[13.5px] text-ink-soft">
                      {habit.name}
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-ink">
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline"
              >
                {active.length > PREVIEW_COUNT
                  ? `View all ${active.length} habits`
                  : "Open full tracker"}{" "}
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Radial preview (opens full tracker) */}
            <div className="order-1 mx-auto shrink-0 sm:order-2">
              <button
                onClick={() => setModalOpen(true)}
                aria-label="Open full habit tracker"
                className="block transition-transform hover:scale-[1.02]"
              >
                <div className="h-[248px] w-[248px]">
                  <RadialTracker
                    habits={top.map((t) => t.habit)}
                    month={new Date()}
                    size={248}
                    interactive={false}
                    maxRings={PREVIEW_COUNT}
                    onSurfaceClick={() => setModalOpen(true)}
                    showDayLabels
                    center={
                      <div>
                        <div className="text-2xl font-bold leading-none text-ink">
                          {overall}%
                        </div>
                        <div className="mt-0.5 text-[10px] font-medium text-ink-muted">
                          Completed
                        </div>
                      </div>
                    }
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="mt-1 text-center text-[11px] text-ink-muted sm:text-right">
            {Math.min(PREVIEW_COUNT, active.length)} shown · {active.length} total
          </div>
        </>
      )}

      <HabitTrackerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialView="radial"
      />
    </Card>
  );
}
