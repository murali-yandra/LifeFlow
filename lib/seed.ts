import type {
  AppData,
  Goal,
  Habit,
  JournalEntry,
  MoodEntry,
  MoodScore,
} from "@/types";
import { addDays, toKey } from "./dates";
import { isScheduled } from "./calculations";
import { uid } from "./utils";

// ── Deterministic PRNG so the seeded demo is stable across reloads ───────────
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

interface HabitSeed {
  name: string;
  description: string;
  icon: string;
  color: Habit["color"];
  freq: Habit["frequency"];
  target: number;
  unit: string;
  reminder: string;
  /** Probability of completion on historical (pre-current-month) days. */
  reliability: number;
}

const daily: Habit["frequency"] = { type: "daily", days: [0, 1, 2, 3, 4, 5, 6] };
const weekdays: Habit["frequency"] = { type: "weekdays", days: [1, 2, 3, 4, 5] };

const HABIT_SEEDS: HabitSeed[] = [
  { name: "Exercise", description: "30 minutes of movement", icon: "Dumbbell", color: "green", freq: daily, target: 1, unit: "session", reminder: "07:00", reliability: 0.92 },
  { name: "Read 30 min", description: "Read to grow every day", icon: "BookOpen", color: "blue", freq: daily, target: 30, unit: "min", reminder: "21:00", reliability: 0.9 },
  { name: "Meditate", description: "Calm the mind", icon: "Brain", color: "purple", freq: daily, target: 10, unit: "min", reminder: "06:30", reliability: 0.93 },
  { name: "Drink Water", description: "Stay hydrated", icon: "GlassWater", color: "teal", freq: daily, target: 8, unit: "glasses", reminder: "", reliability: 0.95 },
  { name: "No Sugar", description: "Skip added sugar", icon: "Apple", color: "pink", freq: daily, target: 1, unit: "day", reminder: "", reliability: 0.82 },
  { name: "Walk 8,000 Steps", description: "Keep moving", icon: "Footprints", color: "orange", freq: daily, target: 8000, unit: "steps", reminder: "", reliability: 0.86 },
  { name: "Sleep 8 Hours", description: "Rest and recover", icon: "Moon", color: "indigo", freq: daily, target: 8, unit: "hours", reminder: "22:30", reliability: 0.83 },
  { name: "Journal", description: "Reflect on the day", icon: "NotebookPen", color: "amber", freq: daily, target: 1, unit: "entry", reminder: "21:30", reliability: 0.8 },
  { name: "Stretch", description: "Loosen up", icon: "Flower2", color: "rose", freq: daily, target: 1, unit: "session", reminder: "", reliability: 0.81 },
  { name: "Learn Something", description: "Study a new topic", icon: "GraduationCap", color: "blue", freq: weekdays, target: 1, unit: "lesson", reminder: "", reliability: 0.86 },
  { name: "Deep Work", description: "Focused, distraction-free work", icon: "Briefcase", color: "purple", freq: weekdays, target: 90, unit: "min", reminder: "09:00", reliability: 0.88 },
  { name: "Protein Goal", description: "Hit daily protein target", icon: "Salad", color: "green", freq: daily, target: 100, unit: "g", reminder: "", reliability: 0.84 },
  { name: "Skincare", description: "Morning & night routine", icon: "Sparkles", color: "pink", freq: daily, target: 1, unit: "routine", reminder: "", reliability: 0.9 },
  { name: "Limit Social Media", description: "Under 30 min of scrolling", icon: "Smartphone", color: "red", freq: daily, target: 30, unit: "min", reminder: "", reliability: 0.72 },
  { name: "Morning Routine", description: "Start the day intentionally", icon: "Sun", color: "orange", freq: daily, target: 1, unit: "routine", reminder: "06:00", reliability: 0.91 },
];

/**
 * Build seed data relative to `today`. History spans ~58 days. The current
 * calendar month up to today is fully completed (giving a clean streak and a
 * ~100% month), while earlier days carry believable variation for rich charts.
 */
export function buildSeed(today: Date = new Date()): AppData {
  const rng = makeRng(20260817);
  const createdAt = new Date(today.getFullYear(), today.getMonth() - 1, 20);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const createdKey = toKey(createdAt);

  const habits: Habit[] = HABIT_SEEDS.map((s) => {
    const completions: string[] = [];
    for (let d = new Date(createdAt); toKey(d) <= toKey(today); d = addDays(d, 1)) {
      const habitShape: Habit = {
        id: "",
        name: s.name,
        description: s.description,
        icon: s.icon,
        color: s.color,
        frequency: s.freq,
        target: s.target,
        unit: s.unit,
        reminder: s.reminder,
        createdAt: createdKey,
        completions: [],
      };
      if (!isScheduled(habitShape, d)) continue;
      const inCurrentMonth = d >= monthStart;
      // Current month up to today → always complete (perfect streak & 100%).
      // Keep the very last day before the month non-perfect so the global
      // streak resolves cleanly to the in-month length.
      const doComplete = inCurrentMonth ? true : rng() < s.reliability;
      if (doComplete) completions.push(toKey(d));
    }
    return {
      id: uid("habit"),
      name: s.name,
      description: s.description,
      icon: s.icon,
      color: s.color,
      frequency: s.freq,
      target: s.target,
      unit: s.unit,
      reminder: s.reminder,
      createdAt: createdKey,
      completions,
    };
  });

  const goals: Goal[] = [
    makeGoal({
      title: "Read 12 Books",
      description: "Finish a book roughly every month this year.",
      category: "long",
      icon: "BookOpen",
      color: "blue",
      target: 12,
      current: 8,
      unit: "books",
      deadline: `${today.getFullYear()}-12-31`,
      today,
    }),
    makeGoal({
      title: "Run a Half Marathon",
      description: "Train up and complete a 21K race.",
      category: "short",
      icon: "PersonStanding",
      color: "purple",
      target: 1,
      current: 1,
      unit: "race",
      deadline: `${today.getFullYear()}-09-30`,
      today,
    }),
    makeGoal({
      title: "Save ₹5,000",
      description: "Build an emergency buffer this month.",
      category: "monthly",
      icon: "CircleDollarSign",
      color: "orange",
      target: 5000,
      current: 2400,
      unit: "₹",
      unitPrefix: true,
      deadline: toKey(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      today,
    }),
    makeGoal({
      title: "Meditate 100 Hours",
      description: "Log a hundred hours of mindfulness this year.",
      category: "long",
      icon: "Brain",
      color: "teal",
      target: 100,
      current: 64,
      unit: "hours",
      deadline: `${today.getFullYear()}-12-31`,
      today,
    }),
    makeGoal({
      title: "Learn 50 Spanish Lessons",
      description: "One lesson a day keeps fluency in reach.",
      category: "monthly",
      icon: "GraduationCap",
      color: "indigo",
      target: 50,
      current: 34,
      unit: "lessons",
      deadline: toKey(new Date(today.getFullYear(), today.getMonth() + 1, 15)),
      today,
    }),
    makeGoal({
      title: "10,000 Push-ups",
      description: "Chip away toward a five-figure total.",
      category: "long",
      icon: "Dumbbell",
      color: "green",
      target: 10000,
      current: 6800,
      unit: "reps",
      deadline: `${today.getFullYear()}-12-31`,
      today,
    }),
  ];

  const moods: MoodEntry[] = [];
  // Two weeks of hand-tuned history (oldest → today) that rises and dips
  // naturally and ends on a high note to match today's journal entry.
  const moodSeq: MoodScore[] = [4, 3, 4, 5, 4, 3, 4, 3, 4, 4, 5, 4, 4, 5, 5];
  for (let i = 14; i >= 0; i--) {
    const d = addDays(today, -i);
    const score = moodSeq[14 - i];
    moods.push({
      id: uid("mood"),
      date: toKey(d),
      mood: score,
      note: i === 0 ? "Feeling steady and focused today." : "",
    });
  }

  const journal: JournalEntry[] = [
    {
      id: uid("jr"),
      date: new Date(today).toISOString(),
      title: "A productive day",
      content:
        "Kept the streak alive — every habit done before noon. The morning routine really sets the tone; by the time I sat down for deep work I already felt ahead. Small actions, repeated.",
      mood: 5,
      tags: ["productivity", "fitness"],
    },
    {
      id: uid("jr"),
      date: addDays(today, -2).toISOString(),
      title: "Slower, but steady",
      content:
        "Energy dipped a little but I still showed up for the essentials. Learning to be okay with 'good enough' days instead of chasing perfect ones.",
      mood: 3,
      tags: ["reflection", "balance"],
    },
    {
      id: uid("jr"),
      date: addDays(today, -5).toISOString(),
      title: "Finished another book",
      content:
        "Eighth book of the year done. Reading before bed has quietly become my favorite part of the day. Two-thirds of the way to the goal.",
      mood: 4,
      tags: ["reading", "goals"],
    },
  ];

  return {
    habits,
    goals,
    moods,
    journal,
    version: 1,
    preferences: {
      name: "Murali",
      weekStartsMonday: false,
      dateFormat: "long",
      dashboardPeriod: "month",
      notifications: {
        habitReminders: true,
        goalReminders: true,
        dailyCheckIn: true,
      },
    },
  };
}

function makeGoal(input: {
  title: string;
  description: string;
  category: Goal["category"];
  icon: string;
  color: Goal["color"];
  target: number;
  current: number;
  unit: string;
  unitPrefix?: boolean;
  deadline: string;
  today: Date;
}): Goal {
  const { today, ...g } = input;
  return {
    id: uid("goal"),
    title: g.title,
    description: g.description,
    category: g.category,
    icon: g.icon,
    color: g.color,
    target: g.target,
    current: g.current,
    unit: g.unit,
    unitPrefix: g.unitPrefix,
    deadline: g.deadline,
    createdAt: toKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
    milestones: [
      { id: uid("ms"), label: "Getting started", percent: 25 },
      { id: uid("ms"), label: "Halfway there", percent: 50 },
      { id: uid("ms"), label: "In the home stretch", percent: 75 },
      { id: uid("ms"), label: "Completed", percent: 100 },
    ],
    history: [{ date: toKey(addDays(today, -3)), value: g.current }],
  };
}
