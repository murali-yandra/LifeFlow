"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { NotebookPen, Plus, Search } from "lucide-react";
import type { JournalEntry, MoodScore } from "@/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Empty";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { MOODS, mood as moodDef } from "@/lib/mood";
import { formatLong, fromKey, toKey } from "@/lib/dates";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const { data, hydrated, addJournal, updateJournal, deleteJournal } = useApp();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [moodFilter, setMoodFilter] = useState<MoodScore | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<JournalEntry | null>(null);

  const editing = data.journal.find((j) => j.id === editingId) ?? null;

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...data.journal]
      .filter((j) => {
        const matchesQuery =
          !q ||
          j.title.toLowerCase().includes(q) ||
          j.content.toLowerCase().includes(q) ||
          j.tags.some((t) => t.includes(q));
        const matchesMood = moodFilter === "all" || j.mood === moodFilter;
        return matchesQuery && matchesMood;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.journal, query, moodFilter]);

  if (!hydrated) return <PageSkeleton />;

  const createNew = () => {
    const entry = addJournal({
      date: new Date().toISOString(),
      title: "",
      content: "",
      mood: null,
      tags: [],
    });
    setEditingId(entry.id);
  };

  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="Capture your thoughts."
        right={
          <>
            <span className="hidden sm:block">
              <NotificationBell />
            </span>
            <Button onClick={createNew}>
              <Plus size={17} /> New Entry
            </Button>
          </>
        }
      />

      {data.journal.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <FilterChip active={moodFilter === "all"} onClick={() => setMoodFilter("all")}>
              All
            </FilterChip>
            {MOODS.map((m) => (
              <button
                key={m.score}
                onClick={() => setMoodFilter(m.score)}
                title={m.label}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg border transition-all",
                  moodFilter === m.score ? "border-transparent" : "border-line hover:bg-surface-2",
                )}
                style={
                  moodFilter === m.score
                    ? { backgroundColor: m.soft, color: m.color }
                    : { color: "rgb(var(--ink-muted))" }
                }
              >
                <m.icon size={17} />
              </button>
            ))}
          </div>
        </div>
      )}

      {data.journal.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Your story is waiting to be written."
          description="Capture a thought, a win, or a reflection. Your journal grows one entry at a time."
          action={
            <Button onClick={createNew}>
              <Plus size={17} /> Write an Entry
            </Button>
          }
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching entries"
          description="Try a different search term or mood filter."
        />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {entries.map((j, i) => {
            const md = j.mood ? moodDef(j.mood) : null;
            return (
              <motion.button
                key={j.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setEditingId(j.id)}
                className="mb-4 block w-full break-inside-avoid rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                <div className="text-[12px] font-medium text-ink-muted">
                  {formatLong(fromKey(j.date.slice(0, 10)))}
                </div>
                <h3 className="mt-1 text-[16px] font-semibold text-ink">
                  {j.title || "Untitled entry"}
                </h3>
                {j.content && (
                  <p className="mt-1.5 line-clamp-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
                    {j.content}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {md && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: md.soft, color: md.color }}
                    >
                      <md.icon size={12} /> {md.label}
                    </span>
                  )}
                  {j.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-soft"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <JournalEditor
        entry={editing}
        open={!!editing}
        onClose={() => {
          // Discard fully-empty entries on close.
          if (editing && !editing.title.trim() && !editing.content.trim()) {
            deleteJournal(editing.id);
          }
          setEditingId(null);
        }}
        onChange={(patch) => editing && updateJournal(editing.id, patch)}
        onDelete={() => {
          if (editing) setConfirm(editing);
        }}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            deleteJournal(confirm.id);
            setEditingId(null);
            toast("Entry deleted", "info");
          }
        }}
        title="Delete entry?"
        message="This journal entry will be permanently removed."
        confirmLabel="Delete"
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "bg-brand text-white" : "border border-line text-ink-soft hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}
