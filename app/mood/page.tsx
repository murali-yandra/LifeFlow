"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { MoodScore } from "@/types";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { MoodCalendar } from "@/components/mood/MoodCalendar";
import { MoodTrendChart, type MoodPoint } from "@/components/mood/MoodTrendChart";
import { MOODS, mood as moodDef } from "@/lib/mood";
import { addDays, formatLong, fromKey, isToday, toKey } from "@/lib/dates";
import { averageMood } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export default function MoodPage() {
  const { data, hydrated, setMood } = useApp();
  const { toast } = useToast();
  const [selected, setSelected] = useState(() => new Date());
  const [note, setNote] = useState("");

  const selKey = toKey(selected);
  const existing = data.moods.find((m) => m.date === selKey);
  const [draftMood, setDraftMood] = useState<MoodScore | null>(null);

  // Keep note/mood in sync when the selected day changes.
  const activeMood = draftMood ?? existing?.mood ?? null;

  const points = useMemo<MoodPoint[]>(() => {
    const map = new Map(data.moods.map((m) => [m.date, m.mood]));
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(new Date(), -(13 - i));
      return {
        key: toKey(d),
        label: `${d.getDate()}`,
        score: map.get(toKey(d)) ?? null,
      };
    });
  }, [data.moods]);

  const summary = useMemo(() => {
    const avg = averageMood(data.moods);
    const counts = new Map<MoodScore, number>();
    for (const m of data.moods) counts.set(m.mood, (counts.get(m.mood) ?? 0) + 1);
    let common: MoodScore = 3;
    let max = -1;
    counts.forEach((c, k) => {
      if (c > max) {
        max = c;
        common = k;
      }
    });
    const sorted = [...data.moods].sort((a, b) => b.mood - a.mood);
    const best = sorted[0];
    const low = sorted[sorted.length - 1];
    return { avg, common, best, low };
  }, [data.moods]);

  if (!hydrated) return <PageSkeleton />;

  const selectMood = (score: MoodScore) => {
    setDraftMood(score);
    setMood(selKey, score, note || existing?.note || "");
    toast(`Feeling ${moodDef(score).label.toLowerCase()} — logged`);
  };

  const saveNote = () => {
    if (activeMood) {
      setMood(selKey, activeMood, note);
      toast("Note saved");
    }
  };

  const changeDay = (d: Date) => {
    setSelected(d);
    setDraftMood(null);
    const e = data.moods.find((m) => m.date === toKey(d));
    setNote(e?.note ?? "");
  };

  return (
    <div>
      <PageHeader
        title="How are you feeling?"
        subtitle="Track your emotional patterns over time."
        right={
          <span className="hidden sm:block">
            <NotificationBell />
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Selector */}
        <Card className="lg:col-span-1">
          <div className="mb-1 text-sm font-medium text-ink-soft">
            {isToday(selected) ? "Today" : formatLong(selected)}
          </div>
          <h3 className="mb-4 text-lg font-semibold text-ink">
            {activeMood
              ? `You felt ${moodDef(activeMood).label.toLowerCase()}`
              : "Pick your mood"}
          </h3>

          <div className="space-y-2">
            {MOODS.map((m) => {
              const on = activeMood === m.score;
              return (
                <motion.button
                  key={m.score}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectMood(m.score)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                    on ? "border-transparent" : "border-line hover:bg-surface-2",
                  )}
                  style={on ? { backgroundColor: m.soft } : undefined}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ backgroundColor: on ? "transparent" : m.soft, color: m.color }}
                  >
                    <m.icon size={22} />
                  </span>
                  <span
                    className="text-[15px] font-semibold"
                    style={{ color: on ? m.color : "rgb(var(--ink))" }}
                  >
                    {m.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about your day (optional)…"
              className="min-h-[70px]"
            />
            <Button
              variant="secondary"
              className="mt-2 w-full"
              onClick={saveNote}
              disabled={!activeMood}
            >
              Save note
            </Button>
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-5 lg:col-span-2">
          <MoodCalendar
            moods={data.moods}
            weekStartsMonday={data.preferences.weekStartsMonday}
            selected={selected}
            onSelect={changeDay}
          />

          <Card>
            <CardHeader title="Mood Trends" />
            {points.some((p) => p.score != null) ? (
              <MoodTrendChart points={points} height={220} />
            ) : (
              <p className="py-10 text-center text-sm text-ink-muted">
                Log a few moods to see your trend line.
              </p>
            )}
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryTile
              label="Average Mood"
              value={summary.avg ? summary.avg.toFixed(1) : "—"}
              caption={summary.avg ? moodDef(Math.round(summary.avg) as MoodScore).label : ""}
            />
            <SummaryTile
              label="Most Common"
              value={data.moods.length ? moodDef(summary.common).label : "—"}
            />
            <SummaryTile
              label="Best Day"
              value={summary.best ? moodDef(summary.best.mood).label : "—"}
              caption={summary.best ? formatLong(fromKey(summary.best.date)).replace(/,.*/, "") : ""}
            />
            <SummaryTile
              label="Entries"
              value={String(data.moods.length)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <Card className="text-center" padded>
      <div className="text-xl font-bold text-ink">{value}</div>
      <div className="mt-0.5 text-[12px] font-medium text-ink-soft">{label}</div>
      {caption && <div className="text-[11px] text-ink-muted">{caption}</div>}
    </Card>
  );
}
