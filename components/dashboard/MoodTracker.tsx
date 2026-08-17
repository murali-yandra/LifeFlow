"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MoodEntry } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import { MoodTrendChart, type MoodPoint } from "@/components/mood/MoodTrendChart";
import { EmptyState } from "@/components/ui/Empty";
import { Smile } from "lucide-react";
import { addDays, toKey } from "@/lib/dates";
import { moodValue } from "@/lib/mood";
import { useApp } from "@/context/AppContext";

type Range = "week" | "fortnight";

export function MoodTracker({ moods }: { moods: MoodEntry[] }) {
  const { data } = useApp();
  const types = data.moodTypes;
  const [range, setRange] = useState<Range>("week");

  const points = useMemo<MoodPoint[]>(() => {
    const map = new Map(moods.map((m) => [m.date, m.moodId]));
    const short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const pointFor = (d: Date, label: string): MoodPoint => {
      const id = map.get(toKey(d));
      return {
        key: toKey(d),
        label,
        moodId: id ?? null,
        score: id ? moodValue(types, id) : null,
      };
    };
    if (range === "week") {
      // Trailing 7 days ending today, so the curve always reads left-to-right.
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(new Date(), -(6 - i));
        return pointFor(d, short[d.getDay()]);
      });
    }
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(new Date(), -(13 - i));
      return pointFor(d, `${d.getDate()}`);
    });
  }, [moods, range, types]);

  const hasData = points.some((p) => p.score != null);

  return (
    <Card>
      <CardHeader
        title="Mood Tracker"
        action={
          <Dropdown<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: "week", label: "This Week" },
              { value: "fortnight", label: "14 Days" },
            ]}
          />
        }
      />
      {hasData ? (
        <MoodTrendChart points={points} types={types} />
      ) : (
        <EmptyState
          icon={Smile}
          title="No moods yet"
          description="Log how you're feeling and your emotional trend will appear here."
          action={
            <Link
              href="/mood"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Record a mood <ArrowRight size={14} />
            </Link>
          }
        />
      )}
    </Card>
  );
}
