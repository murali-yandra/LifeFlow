"use client";

import { useState } from "react";
import { Crown, Flame, Star, Target } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { DateSelector } from "@/components/layout/DateSelector";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { StatCard } from "@/components/dashboard/StatCard";
import { HabitProgress } from "@/components/dashboard/HabitProgress";
import { HabitGrid } from "@/components/dashboard/HabitGrid";
import { MoodTracker } from "@/components/dashboard/MoodTracker";
import { GoalsOverview } from "@/components/dashboard/GoalsOverview";
import { PageSkeleton } from "@/components/ui/Skeleton";
import {
  globalBestStreak,
  globalStreak,
  monthCompletion,
  totalCompleted,
} from "@/lib/calculations";
import { greeting } from "@/lib/dates";

export default function DashboardPage() {
  const { data, hydrated, toggleCompletion } = useApp();
  const { toast } = useToast();
  const [selected, setSelected] = useState(() => new Date());

  if (!hydrated) return <PageSkeleton />;

  const name = data.preferences.name || "there";
  const streak = globalStreak(data.habits);
  const best = globalBestStreak(data.habits);
  const month = monthCompletion(data.habits);
  const total = totalCompleted(data.habits);

  const handleToggle = (habitId: string, dateKey: string) => {
    const nowDone = toggleCompletion(habitId, dateKey);
    const habit = data.habits.find((h) => h.id === habitId);
    toast(
      nowDone
        ? `${habit?.name ?? "Habit"} completed`
        : `${habit?.name ?? "Habit"} marked incomplete`,
      nowDone ? "success" : "info",
    );
  };

  return (
    <div>
      <PageHeader
        title={
          <span>
            {greeting()}, {name}! <span className="inline-block">👋</span>
          </span>
        }
        subtitle="Let's make today amazing."
        right={
          <>
            <DateSelector value={selected} onChange={setSelected} />
            <span className="hidden sm:block">
              <NotificationBell />
            </span>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Flame}
          value={String(streak)}
          label="Current Streak"
          hint="days"
          tint="green"
          index={0}
        />
        <StatCard
          icon={Crown}
          value={String(best)}
          label="Best Streak"
          hint="days"
          tint="blue"
          index={1}
        />
        <StatCard
          icon={Target}
          value={`${month}%`}
          label="This Month"
          hint="completion"
          tint="orange"
          index={2}
        />
        <StatCard
          icon={Star}
          value={String(total)}
          label="Total Completed"
          hint="habits"
          tint="purple"
          index={3}
        />
      </div>

      {/* Row 1 */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <HabitProgress habits={data.habits} />
        <HabitGrid
          habits={data.habits}
          selectedDate={selected}
          onToggle={handleToggle}
        />
      </div>

      {/* Row 2 */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <MoodTracker moods={data.moods} />
        <GoalsOverview goals={data.goals} />
      </div>
    </div>
  );
}
