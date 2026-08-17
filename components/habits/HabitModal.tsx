"use client";

import { useEffect, useState } from "react";
import type { AccentColor, FrequencyType, Habit } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ACCENTS } from "@/lib/palette";
import { ICON_CHOICES, getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

type HabitDraft = Omit<Habit, "id" | "createdAt" | "completions">;

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const DOW_FULL = [0, 1, 2, 3, 4, 5, 6];

function defaults(): HabitDraft {
  return {
    name: "",
    description: "",
    icon: "Sparkles",
    color: "green",
    frequency: { type: "daily", days: [0, 1, 2, 3, 4, 5, 6] },
    target: 1,
    unit: "",
    reminder: "",
  };
}

export function HabitModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: HabitDraft) => void;
  initial?: Habit | null;
}) {
  const [draft, setDraft] = useState<HabitDraft>(defaults());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setDraft(
        initial
          ? {
              name: initial.name,
              description: initial.description,
              icon: initial.icon,
              color: initial.color,
              frequency: initial.frequency,
              target: initial.target,
              unit: initial.unit,
              reminder: initial.reminder,
            }
          : defaults(),
      );
    }
  }, [open, initial]);

  const set = <K extends keyof HabitDraft>(key: K, value: HabitDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const setFrequency = (type: FrequencyType) => {
    let days: number[] = [0, 1, 2, 3, 4, 5, 6];
    if (type === "weekdays") days = [1, 2, 3, 4, 5];
    else if (type === "weekends") days = [0, 6];
    else if (type === "custom") days = draft.frequency.days.length ? draft.frequency.days : [1, 2, 3, 4, 5];
    set("frequency", { type, days });
  };

  const toggleDay = (d: number) => {
    const has = draft.frequency.days.includes(d);
    const days = has
      ? draft.frequency.days.filter((x) => x !== d)
      : [...draft.frequency.days, d].sort();
    set("frequency", { type: "custom", days });
  };

  const submit = () => {
    if (!draft.name.trim()) {
      setError("Give your habit a name.");
      return;
    }
    onSave({ ...draft, name: draft.name.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? "Edit habit" : "New habit"}
      description={
        initial
          ? "Update the details of this habit."
          : "Small actions, repeated consistently, create a better life."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{initial ? "Save changes" : "Create habit"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Habit name">
            <Input
              autoFocus
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Morning run"
            />
          </Field>
          <Field label="Reminder (optional)">
            <Input
              type="time"
              value={draft.reminder}
              onChange={(e) => set("reminder", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Description">
          <Textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does this habit involve?"
            className="min-h-[70px]"
          />
        </Field>

        {/* Icon picker */}
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
            Icon
          </span>
          <div className="no-scrollbar flex max-h-[92px] flex-wrap gap-1.5 overflow-y-auto">
            {ICON_CHOICES.map((name) => {
              const Icon = getIcon(name);
              const selected = draft.icon === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => set("icon", name)}
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl border transition-all",
                    selected
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line text-ink-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
            Color
          </span>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => set("color", a.key as AccentColor)}
                aria-label={a.label}
                className={cn(
                  "h-8 w-8 rounded-full ring-offset-2 ring-offset-surface transition-all",
                  draft.color === a.key ? "ring-2" : "hover:scale-110",
                )}
                style={{
                  backgroundColor: a.base,
                  boxShadow: draft.color === a.key ? `0 0 0 2px ${a.base}` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Frequency">
            <Select
              value={draft.frequency.type}
              onChange={(e) => setFrequency(e.target.value as FrequencyType)}
            >
              <option value="daily">Every day</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekends">Weekends</option>
              <option value="custom">Custom</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target">
              <Input
                type="number"
                min={1}
                value={draft.target}
                onChange={(e) => set("target", Math.max(1, Number(e.target.value) || 1))}
              />
            </Field>
            <Field label="Unit">
              <Input
                value={draft.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="min, glasses…"
              />
            </Field>
          </div>
        </div>

        {/* Day selector */}
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">
            Active days
          </span>
          <div className="flex gap-1.5">
            {DOW_FULL.map((d) => {
              const on = draft.frequency.days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "grid h-9 flex-1 place-items-center rounded-xl text-[13px] font-semibold transition-all",
                    on
                      ? "bg-brand text-white"
                      : "border border-line text-ink-muted hover:bg-surface-2",
                  )}
                >
                  {DOW[d]}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}
