"use client";

import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import type { Goal, GoalCategory } from "@/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Empty";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ProgressRing } from "@/components/ui/Progress";
import { Card } from "@/components/ui/Card";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalModal } from "@/components/goals/GoalModal";
import { GoalDetail } from "@/components/goals/GoalDetail";
import { goalPercent, overallGoalProgress } from "@/lib/calculations";
import { cn } from "@/lib/utils";

const FILTERS: { value: GoalCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "short", label: "Short-term" },
  { value: "monthly", label: "Monthly" },
  { value: "long", label: "Long-term" },
];

export default function GoalsPage() {
  const {
    data,
    hydrated,
    addGoal,
    updateGoal,
    deleteGoal,
    setGoalProgress,
  } = useApp();
  const { toast } = useToast();

  const [filter, setFilter] = useState<GoalCategory | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [detail, setDetail] = useState<Goal | null>(null);
  const [confirm, setConfirm] = useState<Goal | null>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? data.goals
        : data.goals.filter((g) => g.category === filter),
    [data.goals, filter],
  );

  const overall = overallGoalProgress(data.goals);
  const completed = data.goals.filter((g) => goalPercent(g) >= 100).length;

  if (!hydrated) return <PageSkeleton />;

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSave = (draft: Omit<Goal, "id" | "createdAt" | "history">) => {
    if (editing) {
      updateGoal(editing.id, draft);
      toast("Goal updated");
    } else {
      addGoal(draft);
      toast("Goal created");
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleStep = (g: Goal, delta: number) => {
    const next = Math.max(0, Math.min(g.target, g.current + delta));
    setGoalProgress(g.id, next);
    if (next >= g.target && g.current < g.target) {
      toast(`${g.title} completed! 🎉`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="Dream it. Plan it. Achieve it."
        right={
          <>
            <span className="hidden sm:block">
              <NotificationBell />
            </span>
            <Button onClick={openNew}>
              <Plus size={17} /> New Goal
            </Button>
          </>
        }
      />

      {data.goals.length > 0 && (
        <Card className="mb-6 flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5">
            <ProgressRing value={overall} size={96} stroke={9}>
              <div className="text-lg font-bold text-ink">{overall}%</div>
            </ProgressRing>
            <div>
              <div className="text-sm text-ink-soft">Overall progress</div>
              <div className="text-2xl font-bold text-ink">
                {completed} of {data.goals.length}
              </div>
              <div className="text-sm text-ink-muted">goals completed</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                  filter === f.value
                    ? "bg-brand text-white"
                    : "border border-line text-ink-soft hover:bg-surface-2",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      {data.goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Dream it. Plan it. Achieve it."
          description="Set your first goal and watch your progress come to life."
          action={
            <Button onClick={openNew}>
              <Plus size={17} /> Create Goal
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nothing here yet"
          description="No goals in this category. Try another filter or create one."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g, i) => (
            <GoalCard
              key={g.id}
              goal={g}
              index={i}
              onStep={(delta) => handleStep(g, delta)}
              onEdit={() => {
                setEditing(g);
                setModalOpen(true);
              }}
              onDelete={() => setConfirm(g)}
              onOpen={() => setDetail(g)}
            />
          ))}
        </div>
      )}

      <GoalModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        initial={editing}
      />

      <GoalDetail goal={detail} open={!!detail} onClose={() => setDetail(null)} />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) {
            deleteGoal(confirm.id);
            toast(`${confirm.title} deleted`, "info");
          }
        }}
        title="Delete goal?"
        message={
          <>
            This will permanently remove <b>{confirm?.title}</b>. This can&apos;t
            be undone.
          </>
        }
        confirmLabel="Delete"
      />
    </div>
  );
}
