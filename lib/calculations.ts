import type { Goal, Habit, MoodEntry, MoodType } from "@/types";
import { addDays, diffDays, fromKey, toKey } from "./dates";
import { moodValue } from "./mood";

/** Is a habit scheduled on the given date, per its frequency? */
export function isScheduled(habit: Habit, date: Date): boolean {
  const dow = date.getDay();
  switch (habit.frequency.type) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekends":
      return dow === 0 || dow === 6;
    case "custom":
      return habit.frequency.days.includes(dow);
    default:
      return true;
  }
}

export function isCompleted(habit: Habit, key: string): boolean {
  return habit.completions.includes(key);
}

/**
 * Current streak: count consecutive *scheduled* days ending today (or the most
 * recent scheduled day) that are completed. Non-scheduled days are skipped and
 * do not break the streak. If today is scheduled but not yet done, the streak
 * still counts up to yesterday.
 */
export function currentStreak(habit: Habit, ref: Date = new Date()): number {
  const set = new Set(habit.completions);
  let streak = 0;
  let cursor = new Date(ref);
  // If today is scheduled but not completed, start counting from yesterday.
  if (isScheduled(habit, cursor) && !set.has(toKey(cursor))) {
    cursor = addDays(cursor, -1);
  }
  // Walk backwards over scheduled days.
  let guard = 0;
  while (guard < 3650) {
    guard++;
    if (isScheduled(habit, cursor)) {
      if (set.has(toKey(cursor))) {
        streak++;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Best (longest) streak of consecutive scheduled completions in history. */
export function bestStreak(habit: Habit): number {
  if (habit.completions.length === 0) return 0;
  const keys = [...habit.completions].sort();
  const start = fromKey(keys[0]);
  const end = new Date();
  let best = 0;
  let run = 0;
  const set = new Set(habit.completions);
  for (let d = new Date(start); diffDays(d, end) <= 0; d = addDays(d, 1)) {
    if (!isScheduled(habit, d)) continue;
    if (set.has(toKey(d))) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

export interface HabitStats {
  current: number;
  best: number;
  completionRate: number; // 0–100 over scheduled days since creation
  totalCompleted: number;
  scheduledCount: number;
}

export function habitStats(habit: Habit, ref: Date = new Date()): HabitStats {
  const created = fromKey(habit.createdAt.slice(0, 10));
  let scheduled = 0;
  let done = 0;
  const set = new Set(habit.completions);
  for (let d = new Date(created); diffDays(d, ref) <= 0; d = addDays(d, 1)) {
    if (!isScheduled(habit, d)) continue;
    scheduled++;
    if (set.has(toKey(d))) done++;
  }
  return {
    current: currentStreak(habit, ref),
    best: bestStreak(habit),
    completionRate: scheduled === 0 ? 0 : Math.round((done / scheduled) * 100),
    totalCompleted: habit.completions.length,
    scheduledCount: scheduled,
  };
}

/** Completion rate for a habit within [start, end] inclusive. */
export function rateInRange(habit: Habit, start: Date, end: Date): number {
  let scheduled = 0;
  let done = 0;
  const set = new Set(habit.completions);
  for (let d = new Date(start); diffDays(d, end) <= 0; d = addDays(d, 1)) {
    if (!isScheduled(habit, d)) continue;
    scheduled++;
    if (set.has(toKey(d))) done++;
  }
  return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
}

/** Fraction (0–1) of scheduled habits completed on a given day. */
export function dayCompletion(habits: Habit[], date: Date): number {
  const scheduled = habits.filter((h) => !h.archived && isScheduled(h, date));
  if (scheduled.length === 0) return 1;
  const done = scheduled.filter((h) => isCompleted(h, toKey(date))).length;
  return done / scheduled.length;
}

// ── Aggregate dashboard stats ────────────────────────────────────────────────

/**
 * Global current streak = consecutive days (ending today/yesterday) where every
 * scheduled habit was completed (a "perfect day").
 */
export function globalStreak(habits: Habit[], ref: Date = new Date()): number {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) return 0;
  const perfect = (d: Date) => {
    const scheduled = active.filter((h) => isScheduled(h, d));
    if (scheduled.length === 0) return true;
    return scheduled.every((h) => isCompleted(h, toKey(d)));
  };
  let cursor = new Date(ref);
  if (!perfect(cursor)) cursor = addDays(cursor, -1);
  let streak = 0;
  let guard = 0;
  while (perfect(cursor) && guard < 3650) {
    streak++;
    cursor = addDays(cursor, -1);
    guard++;
  }
  return streak;
}

export function globalBestStreak(habits: Habit[]): number {
  const active = habits.filter((h) => !h.archived);
  if (active.length === 0) return 0;
  const earliest = active
    .map((h) => h.createdAt.slice(0, 10))
    .sort()[0];
  const start = fromKey(earliest);
  const end = new Date();
  let best = 0;
  let run = 0;
  for (let d = new Date(start); diffDays(d, end) <= 0; d = addDays(d, 1)) {
    const scheduled = active.filter((h) => isScheduled(h, d));
    const perfect =
      scheduled.length === 0 || scheduled.every((h) => isCompleted(h, toKey(d)));
    if (perfect) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

export function monthCompletion(habits: Habit[], ref: Date = new Date()): number {
  const active = habits.filter((h) => !h.archived);
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  let scheduled = 0;
  let done = 0;
  for (const h of active) {
    const set = new Set(h.completions);
    const created = fromKey(h.createdAt.slice(0, 10));
    const from = diffDays(created, start) > 0 ? created : start;
    for (let d = new Date(from); diffDays(d, ref) <= 0; d = addDays(d, 1)) {
      if (!isScheduled(h, d)) continue;
      scheduled++;
      if (set.has(toKey(d))) done++;
    }
  }
  return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
}

export function totalCompleted(habits: Habit[]): number {
  return habits
    .filter((h) => !h.archived)
    .reduce((sum, h) => sum + h.completions.length, 0);
}

// ── Goals ────────────────────────────────────────────────────────────────────

export function goalPercent(goal: Goal): number {
  if (goal.target <= 0) return 0;
  return Math.min(100, Math.round((goal.current / goal.target) * 100));
}

export function overallGoalProgress(goals: Goal[]): number {
  if (goals.length === 0) return 0;
  const sum = goals.reduce((s, g) => s + goalPercent(g), 0);
  return Math.round(sum / goals.length);
}

export function daysRemaining(goal: Goal): number {
  return diffDays(fromKey(goal.deadline.slice(0, 10)), new Date());
}

// ── Mood ─────────────────────────────────────────────────────────────────────

export function averageMood(entries: MoodEntry[], types: MoodType[]): number {
  if (entries.length === 0) return 0;
  return (
    entries.reduce((s, e) => s + moodValue(types, e.moodId), 0) / entries.length
  );
}

export function moodForDate(entries: MoodEntry[], key: string): MoodEntry | undefined {
  return entries.find((e) => e.date === key);
}
