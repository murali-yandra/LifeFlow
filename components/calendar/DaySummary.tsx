"use client";

import { Check, X } from "lucide-react";
import type { Habit } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import { findMoodType, getMoodIcon, moodSoft } from "@/lib/mood";
import { isScheduled } from "@/lib/calculations";
import { formatLong, toKey } from "@/lib/dates";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

export function DaySummary({
  date,
  open,
  onClose,
}: {
  date: Date | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, toggleCompletion } = useApp();
  if (!date) return null;

  const key = toKey(date);
  const scheduled = data.habits.filter((h) => !h.archived && isScheduled(h, date));
  const moodEntry = data.moods.find((m) => m.date === key);
  const journal = data.journal.filter((j) => j.date.slice(0, 10) === key);
  const goalActivity = data.goals.filter((g) =>
    g.history.some((h) => h.date === key),
  );
  const md = moodEntry ? findMoodType(data.moodTypes, moodEntry.moodId) : null;
  const MdIcon = md ? getMoodIcon(md.icon) : null;
  const future = date > new Date();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={formatLong(date)}
      description="Everything that happened on this day."
    >
      <div className="space-y-5">
        {/* Mood */}
        {md && MdIcon && (
          <div
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ backgroundColor: moodSoft(md.color) }}
          >
            <MdIcon size={22} color={md.color} />
            <div>
              <div className="text-sm font-semibold" style={{ color: md.color }}>
                Felt {md.label.toLowerCase()}
              </div>
              {moodEntry?.note && (
                <div className="text-xs text-ink-soft">{moodEntry.note}</div>
              )}
            </div>
          </div>
        )}

        {/* Habits */}
        <div>
          <div className="mb-2 text-sm font-semibold text-ink">
            Habits ({scheduled.filter((h) => h.completions.includes(key)).length}/
            {scheduled.length})
          </div>
          {scheduled.length === 0 ? (
            <p className="text-sm text-ink-muted">No habits scheduled.</p>
          ) : (
            <div className="space-y-1.5">
              {scheduled.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  done={h.completions.includes(key)}
                  disabled={future}
                  onToggle={() => toggleCompletion(h.id, key)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Journal */}
        {journal.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-ink">Journal</div>
            <div className="space-y-2">
              {journal.map((j) => (
                <div key={j.id} className="rounded-xl border border-line p-3">
                  <div className="text-sm font-medium text-ink">{j.title}</div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">
                    {j.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goal activity */}
        {goalActivity.length > 0 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-ink">Goal activity</div>
            <div className="space-y-1.5">
              {goalActivity.map((g) => {
                const a = accent(g.color);
                return (
                  <div key={g.id} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.base }} />
                    <span className="text-ink-soft">{g.title} updated</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function HabitRow({
  habit,
  done,
  disabled,
  onToggle,
}: {
  habit: Habit;
  done: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const a = accent(habit.color);
  const Icon = getIcon(habit.icon);
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2 text-left transition-colors",
        !disabled && "hover:bg-surface-2",
        disabled && "opacity-60",
      )}
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-lg"
        style={{ backgroundColor: a.soft, color: a.base }}
      >
        <Icon size={16} />
      </span>
      <span className="flex-1 text-sm font-medium text-ink">{habit.name}</span>
      <span
        className={cn(
          "grid h-6 w-6 place-items-center rounded-full",
          done ? "text-white" : "border border-line text-ink-muted",
        )}
        style={done ? { backgroundColor: a.base } : undefined}
      >
        {done ? <Check size={14} strokeWidth={3} /> : <X size={12} />}
      </span>
    </button>
  );
}
