"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Sprout } from "lucide-react";
import type { Habit } from "@/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/Empty";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HabitCard } from "@/components/habits/HabitCard";
import { HabitModal } from "@/components/habits/HabitModal";
import { HabitDetail } from "@/components/habits/HabitDetail";
import { todayKey } from "@/lib/dates";

export default function HabitsPage() {
  const {
    data,
    hydrated,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
  } = useApp();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [detail, setDetail] = useState<Habit | null>(null);
  const [confirm, setConfirm] = useState<Habit | null>(null);

  const habits = useMemo(
    () =>
      data.habits.filter((h) =>
        h.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [data.habits, query],
  );

  if (!hydrated) return <PageSkeleton />;

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (h: Habit) => {
    setEditing(h);
    setModalOpen(true);
  };

  const handleSave = (draft: Omit<Habit, "id" | "createdAt" | "completions">) => {
    if (editing) {
      updateHabit(editing.id, draft);
      toast("Habit updated");
    } else {
      addHabit(draft);
      toast("Habit created");
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleToggle = (h: Habit) => {
    const done = toggleCompletion(h.id, todayKey());
    toast(done ? `${h.name} completed` : `${h.name} marked incomplete`, done ? "success" : "info");
  };

  return (
    <div>
      <PageHeader
        title="Habits"
        subtitle="Build consistency one day at a time."
        right={
          <>
            <span className="hidden sm:block">
              <NotificationBell />
            </span>
            <Button onClick={openNew}>
              <Plus size={17} /> New Habit
            </Button>
          </>
        }
      />

      {data.habits.length > 0 && (
        <div className="mb-5 max-w-sm">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search habits…"
              className="pl-9"
            />
          </div>
        </div>
      )}

      {data.habits.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="Your journey starts here."
          description="Create your first habit and start building consistency, one small action at a time."
          action={
            <Button onClick={openNew}>
              <Plus size={17} /> Create Habit
            </Button>
          }
        />
      ) : habits.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          description={`No habits match “${query}”. Try a different search.`}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {habits.map((h, i) => (
            <HabitCard
              key={h.id}
              habit={h}
              index={i}
              onToggle={() => handleToggle(h)}
              onEdit={() => openEdit(h)}
              onDelete={() => setConfirm(h)}
              onOpen={() => setDetail(h)}
            />
          ))}
        </div>
      )}

      <HabitModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />

      <HabitDetail
        habit={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            deleteHabit(confirm.id);
            toast(`${confirm.name} deleted`, "info");
          }
        }}
        title="Delete habit?"
        message={
          <>
            This will permanently remove <b>{confirm?.name}</b> and its history.
            This can&apos;t be undone.
          </>
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
