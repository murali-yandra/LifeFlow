"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { JournalEntry, MoodScore } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { MOODS } from "@/lib/mood";
import { formatLong, fromKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function JournalEditor({
  entry,
  open,
  onClose,
  onChange,
  onDelete,
}: {
  entry: JournalEntry | null;
  open: boolean;
  onClose: () => void;
  onChange: (patch: Partial<JournalEntry>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
      setTagInput("");
    }
  }, [entry]);

  // Debounced autosave to storage via onChange.
  useEffect(() => {
    if (!entry || !open) return;
    const t = setTimeout(() => {
      if (title !== entry.title || content !== entry.content) {
        onChange({ title, content });
        setSaved(true);
        setTimeout(() => setSaved(false), 1200);
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  if (!entry) return null;

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (t && !entry.tags.includes(t)) onChange({ tags: [...entry.tags, t] });
    setTagInput("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" className="text-red-500" onClick={onDelete}>
            Delete
          </Button>
          <div className="flex-1" />
          <span className="mr-2 text-xs text-ink-muted">
            {saved ? "Saved ✓" : "Autosaves as you type"}
          </span>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="-mt-1">
        <div className="text-xs font-medium text-ink-muted">
          {formatLong(fromKey(entry.date.slice(0, 10)))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give this entry a title…"
          className="mt-2 w-full bg-transparent text-2xl font-bold tracking-tight text-ink outline-none placeholder:text-ink-muted/60"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind today?"
          className="mt-3 min-h-[220px] w-full resize-y bg-transparent text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-muted/60"
        />

        {/* Mood */}
        <div className="mt-4 border-t border-line pt-4">
          <div className="mb-2 text-[13px] font-medium text-ink-soft">
            How did the day feel?
          </div>
          <div className="flex gap-2">
            {MOODS.map((m) => {
              const on = entry.mood === m.score;
              return (
                <button
                  key={m.score}
                  onClick={() =>
                    onChange({ mood: on ? null : (m.score as MoodScore) })
                  }
                  title={m.label}
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-xl border transition-all",
                    on ? "border-transparent" : "border-line hover:bg-surface-2",
                  )}
                  style={on ? { backgroundColor: m.soft, color: m.color } : { color: "rgb(var(--ink-muted))" }}
                >
                  <m.icon size={22} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4">
          <div className="mb-2 text-[13px] font-medium text-ink-soft">Tags</div>
          <div className="flex flex-wrap items-center gap-2">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[12px] font-medium text-brand"
              >
                #{t}
                <button
                  onClick={() =>
                    onChange({ tags: entry.tags.filter((x) => x !== t) })
                  }
                  className="hover:text-red-500"
                  aria-label={`Remove ${t}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag…"
              className="h-8 w-28"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
