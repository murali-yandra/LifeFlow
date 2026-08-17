"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, SlidersHorizontal, Sprout } from "lucide-react";
import type { Habit } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Empty";
import { RadialTracker } from "@/components/habits/RadialTracker";
import { HabitTrackerModal } from "@/components/habits/HabitTrackerModal";
import { getIcon } from "@/lib/icons";
import { accentBase } from "@/lib/palette";
import { rateInRange } from "@/lib/calculations";
import { addDays, startOfMonth } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

type Period = "week" | "month" | "year";
const PREVIEW_COUNT = 5;

export function HabitProgress({ habits }: { habits: Habit[] }) {
  const { data, setPinnedHabits } = useApp();
  const [period, setPeriod] = useState<Period>("month");
  const [modalOpen, setModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const active = habits.filter((h) => !h.archived);

  const rateOf = useMemo(() => {
    const now = new Date();
    let start: Date;
    if (period === "week") start = addDays(now, -6);
    else if (period === "month") start = startOfMonth(now);
    else start = new Date(now.getFullYear(), 0, 1);
    return (h: Habit) => rateInRange(h, start, now);
  }, [period]);

  // Pinned selection (in the user's chosen order) takes priority; otherwise the
  // top 5 by completion rate for the current period.
  const top = useMemo(() => {
    const pinned = data.pinnedHabits
      .map((id) => active.find((h) => h.id === id))
      .filter((h): h is Habit => !!h);
    const list =
      pinned.length > 0
        ? pinned.slice(0, PREVIEW_COUNT)
        : [...active].sort((a, b) => rateOf(b) - rateOf(a)).slice(0, PREVIEW_COUNT);
    return list.map((habit) => ({ habit, value: rateOf(habit) }));
  }, [active, data.pinnedHabits, rateOf]);

  const isPinned = data.pinnedHabits.length > 0;
  const overall = top.length
    ? Math.round(top.reduce((s, r) => s + r.value, 0) / top.length)
    : 0;

  return (
    <Card>
      <CardHeader
        title="Habit Progress"
        action={
          <div className="flex items-center gap-1">
            {active.length > 0 && (
              <button
                onClick={() => setPickerOpen(true)}
                title="Choose dashboard habits"
                aria-label="Choose dashboard habits"
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <SlidersHorizontal size={16} />
              </button>
            )}
            <Dropdown<Period>
              value={period}
              onChange={setPeriod}
              options={[
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
                { value: "year", label: "This Year" },
              ]}
            />
          </div>
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
            {/* Legend */}
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

            {/* Radial preview */}
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
            {isPinned ? "Pinned" : `Top ${top.length}`} · {active.length} total
          </div>
        </>
      )}

      <HabitTrackerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialView="radial"
      />

      <HabitPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        habits={active}
        pinned={data.pinnedHabits}
        onSave={(ids) => setPinnedHabits(ids)}
      />
    </Card>
  );
}

function HabitPicker({
  open,
  onClose,
  habits,
  pinned,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  habits: Habit[];
  pinned: string[];
  onSave: (ids: string[]) => void;
}) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>(pinned);

  useEffect(() => {
    if (open) setSelected(pinned);
  }, [open, pinned]);

  const toggle = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= 5 ? s : [...s, id],
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Dashboard habits"
      description="Pick up to 5 habits to feature in the radial preview. Leave empty to auto-show your top performers."
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setSelected([]);
            }}
          >
            Clear (auto)
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(selected);
              toast(
                selected.length ? "Dashboard habits updated" : "Showing top habits",
              );
              onClose();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-1">
        <div className="mb-2 text-[12px] font-medium text-ink-muted">
          {selected.length}/5 selected
        </div>
        {habits.map((h) => {
          const Icon = getIcon(h.icon);
          const on = selected.includes(h.id);
          const disabled = !on && selected.length >= 5;
          return (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              disabled={disabled}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                on ? "border-brand bg-brand-soft" : "border-line hover:bg-surface-2",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${accentBase(h.color)}1f`, color: accentBase(h.color) }}
              >
                <Icon size={16} />
              </span>
              <span className="flex-1 truncate text-sm font-medium text-ink">
                {h.name}
              </span>
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-md border",
                  on ? "border-transparent bg-brand text-white" : "border-line",
                )}
              >
                {on && <Check size={13} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
