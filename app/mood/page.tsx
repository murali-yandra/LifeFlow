"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Settings2, Trash2 } from "lucide-react";
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
import { MoodTypeManager } from "@/components/mood/MoodTypeManager";
import { findMoodType, getMoodIcon, moodSoft, moodValue } from "@/lib/mood";
import { addDays, formatLong, fromKey, isToday, toKey } from "@/lib/dates";
import { averageMood } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export default function MoodPage() {
  const { data, hydrated, setMood, deleteMood } = useApp();
  const { toast } = useToast();
  const types = data.moodTypes;
  const [selected, setSelected] = useState(() => new Date());
  const [note, setNote] = useState("");
  const [draftMood, setDraftMood] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  const selKey = toKey(selected);
  const existing = data.moods.find((m) => m.date === selKey);
  const activeMoodId = draftMood ?? existing?.moodId ?? null;
  const activeMood = findMoodType(types, activeMoodId);

  const points = useMemo<MoodPoint[]>(() => {
    const map = new Map(data.moods.map((m) => [m.date, m.moodId]));
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(new Date(), -(13 - i));
      const id = map.get(toKey(d));
      return {
        key: toKey(d),
        label: `${d.getDate()}`,
        moodId: id ?? null,
        score: id ? moodValue(types, id) : null,
      };
    });
  }, [data.moods, types]);

  const summary = useMemo(() => {
    const avg = averageMood(data.moods, types);
    const counts = new Map<string, number>();
    for (const m of data.moods)
      counts.set(m.moodId, (counts.get(m.moodId) ?? 0) + 1);
    let commonId = types[0]?.id ?? "";
    let max = -1;
    counts.forEach((c, k) => {
      if (c > max) {
        max = c;
        commonId = k;
      }
    });
    const sorted = [...data.moods].sort(
      (a, b) => moodValue(types, b.moodId) - moodValue(types, a.moodId),
    );
    return { avg, common: findMoodType(types, commonId), best: sorted[0] };
  }, [data.moods, types]);

  if (!hydrated) return <PageSkeleton />;

  const selectMood = (id: string) => {
    setDraftMood(id);
    setMood(selKey, id, note || existing?.note || "");
    toast(`Feeling ${findMoodType(types, id)?.label.toLowerCase() ?? "logged"} — logged`);
  };

  const saveNote = () => {
    if (activeMoodId) {
      setMood(selKey, activeMoodId, note);
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
          <>
            <Button variant="secondary" onClick={() => setManagerOpen(true)}>
              <Settings2 size={16} /> Manage moods
            </Button>
            <span className="hidden sm:block">
              <NotificationBell />
            </span>
          </>
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
              ? `You felt ${activeMood.label.toLowerCase()}`
              : "Pick your mood"}
          </h3>

          <div className="space-y-2">
            {types.map((m) => {
              const on = activeMoodId === m.id;
              const Icon = getMoodIcon(m.icon);
              return (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectMood(m.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                    on ? "border-transparent" : "border-line hover:bg-surface-2",
                  )}
                  style={on ? { backgroundColor: moodSoft(m.color) } : undefined}
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                      backgroundColor: on ? "transparent" : moodSoft(m.color),
                      color: m.color,
                    }}
                  >
                    <Icon size={22} />
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
              disabled={!activeMoodId}
            >
              Save note
            </Button>
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-5 lg:col-span-2">
          <MoodCalendar
            moods={data.moods}
            types={types}
            weekStartsMonday={data.preferences.weekStartsMonday}
            selected={selected}
            onSelect={changeDay}
          />

          <Card>
            <CardHeader title="Mood Trends" />
            {points.some((p) => p.score != null) ? (
              <MoodTrendChart points={points} types={types} height={220} />
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
              caption={
                summary.avg && types.length
                  ? types[Math.max(0, types.length - Math.round(summary.avg))]?.label ?? ""
                  : ""
              }
            />
            <SummaryTile
              label="Most Common"
              value={data.moods.length ? summary.common?.label ?? "—" : "—"}
            />
            <SummaryTile
              label="Best Day"
              value={
                summary.best
                  ? findMoodType(types, summary.best.moodId)?.label ?? "—"
                  : "—"
              }
              caption={
                summary.best
                  ? formatLong(fromKey(summary.best.date)).replace(/,.*/, "")
                  : ""
              }
            />
            <SummaryTile label="Entries" value={String(data.moods.length)} />
          </div>

          {/* Recent entries — edit or delete any logged mood */}
          {data.moods.length > 0 && (
            <Card>
              <CardHeader title="Recent Entries" />
              <div className="no-scrollbar max-h-[320px] space-y-2 overflow-y-auto">
                {[...data.moods]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((m) => {
                    const md = findMoodType(types, m.moodId);
                    const MdIcon = md ? getMoodIcon(md.icon) : null;
                    const activeRow = m.date === selKey;
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-2.5 transition-colors",
                          activeRow ? "border-brand/40 bg-brand-soft/40" : "border-line",
                        )}
                      >
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                          style={{
                            backgroundColor: md ? moodSoft(md.color) : "rgb(var(--surface-2))",
                            color: md?.color ?? "rgb(var(--ink-muted))",
                          }}
                        >
                          {MdIcon && <MdIcon size={20} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-ink">
                              {md?.label ?? "Mood"}
                            </span>
                            <span className="text-[12px] text-ink-muted">
                              {formatLong(fromKey(m.date))}
                            </span>
                          </div>
                          {m.note && (
                            <p className="truncate text-[12.5px] text-ink-soft">
                              {m.note}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            changeDay(fromKey(m.date));
                            if (typeof window !== "undefined")
                              window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                          aria-label={`Edit mood for ${m.date}`}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => {
                            deleteMood(m.date);
                            if (m.date === selKey) setDraftMood(null);
                            toast("Mood entry deleted", "info");
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                          aria-label={`Delete mood for ${m.date}`}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>
      </div>

      <MoodTypeManager open={managerOpen} onClose={() => setManagerOpen(false)} />
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
