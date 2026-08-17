"use client";

import { useEffect, useState } from "react";
import type { AccentColor, Goal, GoalCategory } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ACCENTS } from "@/lib/palette";
import { ICON_CHOICES, getIcon } from "@/lib/icons";
import { toKey } from "@/lib/dates";
import { uid } from "@/lib/utils";
import { cn } from "@/lib/utils";

type GoalDraft = Omit<Goal, "id" | "createdAt" | "history">;

function defaults(): GoalDraft {
  const end = new Date();
  end.setMonth(end.getMonth() + 3);
  return {
    title: "",
    description: "",
    category: "monthly",
    icon: "Target",
    color: "green",
    target: 10,
    current: 0,
    unit: "",
    unitPrefix: false,
    deadline: toKey(end),
    milestones: [
      { id: uid("ms"), label: "Getting started", percent: 25 },
      { id: uid("ms"), label: "Halfway there", percent: 50 },
      { id: uid("ms"), label: "In the home stretch", percent: 75 },
      { id: uid("ms"), label: "Completed", percent: 100 },
    ],
  };
}

export function GoalModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (draft: GoalDraft) => void;
  initial?: Goal | null;
}) {
  const [draft, setDraft] = useState<GoalDraft>(defaults());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setDraft(
        initial
          ? {
              title: initial.title,
              description: initial.description,
              category: initial.category,
              icon: initial.icon,
              color: initial.color,
              target: initial.target,
              current: initial.current,
              unit: initial.unit,
              unitPrefix: initial.unitPrefix,
              deadline: initial.deadline.slice(0, 10),
              milestones: initial.milestones,
            }
          : defaults(),
      );
    }
  }, [open, initial]);

  const set = <K extends keyof GoalDraft>(key: K, value: GoalDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = () => {
    if (!draft.title.trim()) {
      setError("Give your goal a title.");
      return;
    }
    if (draft.target <= 0) {
      setError("Target must be greater than zero.");
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      current: Math.min(draft.current, draft.target),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? "Edit goal" : "New goal"}
      description="Dream it. Plan it. Achieve it."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>{initial ? "Save changes" : "Create goal"}</Button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Goal title">
          <Input
            autoFocus
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Read 12 books"
          />
        </Field>

        <Field label="Description">
          <Textarea
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Why does this goal matter to you?"
            className="min-h-[64px]"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Current">
            <Input
              type="number"
              min={0}
              value={draft.current}
              onChange={(e) => set("current", Math.max(0, Number(e.target.value) || 0))}
            />
          </Field>
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
              placeholder="books, km, ₹…"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={draft.category}
              onChange={(e) => set("category", e.target.value as GoalCategory)}
            >
              <option value="short">Short-term</option>
              <option value="monthly">Monthly</option>
              <option value="long">Long-term</option>
            </Select>
          </Field>
          <Field label="Deadline">
            <Input
              type="date"
              value={draft.deadline}
              onChange={(e) => set("deadline", e.target.value)}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={!!draft.unitPrefix}
            onChange={(e) => set("unitPrefix", e.target.checked)}
            className="h-4 w-4 accent-[rgb(var(--brand))]"
          />
          <span className="text-sm text-ink-soft">
            Show unit as a prefix (e.g. ₹2,400 instead of 2,400 ₹)
          </span>
        </label>

        {/* Icon */}
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">Icon</span>
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

        {/* Color */}
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">Color</span>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                onClick={() => set("color", a.key as AccentColor)}
                aria-label={a.label}
                className={cn(
                  "h-8 w-8 rounded-full transition-all",
                  draft.color === a.key ? "" : "hover:scale-110",
                )}
                style={{
                  backgroundColor: a.base,
                  boxShadow: draft.color === a.key ? `0 0 0 2px ${a.base}` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      </div>
    </Modal>
  );
}
