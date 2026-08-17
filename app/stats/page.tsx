"use client";

import { useMemo } from "react";
import { Award, Flame, TrendingUp, Trophy } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Card, CardHeader } from "@/components/ui/Card";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/Empty";
import { WeeklyBars, type BarPoint } from "@/components/stats/WeeklyBars";
import { YearHeatmap } from "@/components/stats/YearHeatmap";
import { getIcon } from "@/lib/icons";
import { accent } from "@/lib/palette";
import {
  bestStreak,
  dayCompletion,
  globalBestStreak,
  globalStreak,
  habitStats,
} from "@/lib/calculations";
import { addDays } from "@/lib/dates";
import { ChartNoAxesCombined } from "lucide-react";

export default function StatsPage() {
  const { data, hydrated } = useApp();

  const active = useMemo(
    () => data.habits.filter((h) => !h.archived),
    [data.habits],
  );

  const ranking = useMemo(
    () =>
      active
        .map((h) => ({ habit: h, rate: habitStats(h).completionRate }))
        .sort((a, b) => b.rate - a.rate),
    [active],
  );

  const weekly = useMemo<BarPoint[]>(() => {
    // Last 8 weeks, each bar = average daily completion for that week.
    const out: BarPoint[] = [];
    const today = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekEnd = addDays(today, -w * 7);
      let sum = 0;
      let n = 0;
      for (let d = 6; d >= 0; d--) {
        const day = addDays(weekEnd, -d);
        if (day > today) continue;
        sum += dayCompletion(active, day);
        n++;
      }
      out.push({
        label: w === 0 ? "This wk" : `${w}w`,
        value: n ? Math.round((sum / n) * 100) : 0,
      });
    }
    return out;
  }, [active]);

  const streaks = useMemo(() => {
    const current = globalStreak(data.habits);
    const best = globalBestStreak(data.habits);
    const habitBests = active.map((h) => bestStreak(h));
    const avg = habitBests.length
      ? Math.round(habitBests.reduce((s, x) => s + x, 0) / habitBests.length)
      : 0;
    const longest = habitBests.length ? Math.max(...habitBests) : 0;
    return { current, best, avg, longest };
  }, [data.habits, active]);

  if (!hydrated) return <PageSkeleton />;

  if (active.length === 0) {
    return (
      <div>
        <PageHeader title="Stats" subtitle="Deeper insight into your consistency." />
        <EmptyState
          icon={ChartNoAxesCombined}
          title="No stats yet"
          description="Create a few habits and start completing them — your analytics will appear here."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Stats"
        subtitle="Deeper insight into your consistency."
        right={
          <span className="hidden sm:block">
            <NotificationBell />
          </span>
        }
      />

      {/* Streak cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StreakCard icon={Flame} tint="green" value={streaks.current} label="Current streak" suffix="days" />
        <StreakCard icon={Trophy} tint="orange" value={streaks.best} label="Best streak" suffix="days" />
        <StreakCard icon={TrendingUp} tint="blue" value={streaks.avg} label="Avg habit streak" suffix="days" />
        <StreakCard icon={Award} tint="purple" value={streaks.longest} label="Longest habit streak" suffix="days" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Weekly overview */}
        <Card>
          <CardHeader title="Weekly overview" />
          <WeeklyBars points={weekly} />
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader title="Most consistent habits" />
          <div className="space-y-2.5">
            {ranking.slice(0, 8).map(({ habit, rate }, i) => {
              const a = accent(habit.color);
              const Icon = getIcon(habit.icon);
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <span className="w-4 text-center text-[13px] font-bold text-ink-muted tabular-nums">
                    {i + 1}
                  </span>
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                    style={{ backgroundColor: a.soft, color: a.base }}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-[13.5px] font-medium text-ink">
                        {habit.name}
                      </span>
                      <span className="text-[13px] font-semibold text-ink-soft tabular-nums">
                        {rate}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${rate}%`, backgroundColor: a.base }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Year heatmap */}
      <Card className="mt-5">
        <CardHeader title="This year at a glance" />
        <YearHeatmap habits={active} />
      </Card>
    </div>
  );
}

function StreakCard({
  icon: Icon,
  tint,
  value,
  label,
  suffix,
}: {
  icon: any;
  tint: "green" | "blue" | "orange" | "purple";
  value: number;
  label: string;
  suffix: string;
}) {
  const tints: Record<string, string> = {
    green: "bg-brand-soft text-brand",
    blue: "bg-blue-100 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
    orange: "bg-orange-100 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400",
  };
  return (
    <Card className="flex items-center gap-3">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tints[tint]}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-bold leading-none text-ink">{value}</div>
        <div className="mt-1 text-[12px] text-ink-soft">
          {label} · {suffix}
        </div>
      </div>
    </Card>
  );
}
