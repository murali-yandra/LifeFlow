"use client";

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import type { MoodType } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import {
  MOOD_COLORS,
  MOOD_ICON_CHOICES,
  getMoodIcon,
  moodSoft,
} from "@/lib/mood";
import { cn } from "@/lib/utils";

type Draft = { label: string; icon: string; color: string };

export function MoodTypeManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data, addMoodType, updateMoodType, deleteMoodType, moveMoodType } =
    useApp();
  const { toast } = useToast();
  const types = data.moodTypes;

  // null = list view · "new" = add form · MoodType = edit form
  const [editing, setEditing] = useState<MoodType | "new" | null>(null);
  const [confirm, setConfirm] = useState<MoodType | null>(null);

  const usageCount = (id: string) =>
    data.moods.filter((m) => m.moodId === id).length;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        size="md"
        title={editing ? (editing === "new" ? "New mood" : "Edit mood") : "Manage moods"}
        description={
          editing
            ? "Choose a name, an icon and a color."
            : "Add, rename, recolor, reorder or remove the moods you track."
        }
        footer={
          editing ? undefined : (
            <>
              <div className="flex-1" />
              <Button variant="secondary" onClick={onClose}>
                Done
              </Button>
            </>
          )
        }
      >
        {editing ? (
          <MoodEditor
            initial={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSave={(draft) => {
              if (editing === "new") {
                addMoodType(draft);
                toast(`Added “${draft.label}”`);
              } else {
                updateMoodType(editing.id, draft);
                toast("Mood updated");
              }
              setEditing(null);
            }}
          />
        ) : (
          <div>
            <div className="space-y-2">
              {types.map((t, i) => {
                const Icon = getMoodIcon(t.icon);
                const uses = usageCount(t.id);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-line p-2.5"
                  >
                    {/* Reorder */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveMoodType(t.id, -1)}
                        disabled={i === 0}
                        className="grid h-4 w-5 place-items-center rounded text-ink-muted hover:text-ink disabled:opacity-30"
                        aria-label="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveMoodType(t.id, 1)}
                        disabled={i === types.length - 1}
                        className="grid h-4 w-5 place-items-center rounded text-ink-muted hover:text-ink disabled:opacity-30"
                        aria-label="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                      style={{ backgroundColor: moodSoft(t.color), color: t.color }}
                    >
                      <Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink">{t.label}</div>
                      <div className="text-[11px] text-ink-muted">
                        {uses} {uses === 1 ? "entry" : "entries"}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditing(t)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                      aria-label={`Edit ${t.label}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setConfirm(t)}
                      disabled={types.length <= 1}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-30 dark:hover:bg-red-500/10"
                      aria-label={`Delete ${t.label}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>

            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setEditing("new")}
            >
              <Plus size={16} /> Add a mood
            </Button>
            <p className="mt-3 text-center text-[11px] text-ink-muted">
              Moods are ordered best (top) to lowest — this sets the trend chart scale.
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            const n = usageCount(confirm.id);
            deleteMoodType(confirm.id);
            toast(
              n > 0
                ? `Deleted “${confirm.label}” and ${n} ${n === 1 ? "entry" : "entries"}`
                : `Deleted “${confirm.label}”`,
              "info",
            );
          }
        }}
        title="Delete this mood?"
        message={
          confirm && usageCount(confirm.id) > 0 ? (
            <>
              <b>{confirm.label}</b> is used by {usageCount(confirm.id)} logged{" "}
              {usageCount(confirm.id) === 1 ? "entry" : "entries"}. Deleting it will
              remove those entries too. This can&apos;t be undone.
            </>
          ) : (
            <>
              Remove <b>{confirm?.label}</b> from your mood palette?
            </>
          )
        }
        confirmLabel="Delete"
      />
    </>
  );
}

function MoodEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: MoodType | null;
  onSave: (draft: Draft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(
    initial
      ? { label: initial.label, icon: initial.icon, color: initial.color }
      : { label: "", icon: "Smile", color: MOOD_COLORS[0] },
  );
  const [error, setError] = useState("");
  const Preview = getMoodIcon(draft.icon);

  const submit = () => {
    if (!draft.label.trim()) {
      setError("Give this mood a name.");
      return;
    }
    onSave({ ...draft, label: draft.label.trim() });
  };

  return (
    <div>
      <button
        onClick={onCancel}
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to moods
      </button>

      {/* Live preview */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line p-3">
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{ backgroundColor: moodSoft(draft.color), color: draft.color }}
        >
          <Preview size={26} />
        </span>
        <div className="text-[15px] font-semibold" style={{ color: draft.color }}>
          {draft.label || "Your mood"}
        </div>
      </div>

      <Field label="Name">
        <Input
          autoFocus
          value={draft.label}
          onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          placeholder="e.g. Excited, Anxious, Calm…"
        />
      </Field>

      {/* Icon picker */}
      <div className="mt-4">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">Icon</span>
        <div className="no-scrollbar flex max-h-[104px] flex-wrap gap-1.5 overflow-y-auto">
          {MOOD_ICON_CHOICES.map((name) => {
            const Icon = getMoodIcon(name);
            const on = draft.icon === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, icon: name }))}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl border transition-all",
                  on ? "border-transparent" : "border-line hover:bg-surface-2",
                )}
                style={
                  on
                    ? { backgroundColor: moodSoft(draft.color), color: draft.color }
                    : { color: "rgb(var(--ink-muted))" }
                }
              >
                <Icon size={19} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color picker */}
      <div className="mt-4">
        <span className="mb-1.5 block text-[13px] font-medium text-ink-soft">Color</span>
        <div className="flex flex-wrap gap-2">
          {MOOD_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, color: c }))}
              aria-label={c}
              className="h-8 w-8 rounded-full transition-all hover:scale-110"
              style={{
                backgroundColor: c,
                boxShadow: draft.color === c ? `0 0 0 2px ${c}` : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-500">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={submit}>{initial ? "Save changes" : "Add mood"}</Button>
      </div>
    </div>
  );
}
