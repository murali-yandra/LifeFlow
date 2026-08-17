// ── Shared domain types for LifeFlow ─────────────────────────────────────────

/** Keys into the fixed accent palette (see lib/palette.ts). */
export type AccentColor =
  | "green"
  | "blue"
  | "purple"
  | "orange"
  | "pink"
  | "teal"
  | "red"
  | "amber"
  | "indigo"
  | "rose";

/** Lucide icon name used to render a habit / goal glyph (see lib/icons.ts). */
export type IconName = string;

export type FrequencyType = "daily" | "weekdays" | "weekends" | "custom";

export interface Frequency {
  type: FrequencyType;
  /** Days of week (0 = Sunday … 6 = Saturday) for custom frequency. */
  days: number[];
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  color: AccentColor;
  frequency: Frequency;
  /** Optional numeric target (e.g. glasses of water). Purely descriptive here. */
  target: number;
  unit: string;
  reminder: string; // "" = none, otherwise "HH:mm"
  createdAt: string; // ISO date
  /** ISO date strings (YYYY-MM-DD) on which the habit was completed. */
  completions: string[];
  archived?: boolean;
}

export interface Milestone {
  id: string;
  label: string;
  /** Percentage (0–100) at which this milestone is reached. */
  percent: number;
}

export type GoalCategory = "short" | "monthly" | "long";

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  icon: IconName;
  color: AccentColor;
  target: number;
  current: number;
  unit: string; // "" | "books" | "₹" | "km" …
  /** Whether unit is a currency prefix (₹2,400) vs suffix (8 books). */
  unitPrefix?: boolean;
  deadline: string; // ISO date
  milestones: Milestone[];
  createdAt: string;
  history: { date: string; value: number }[];
}

/**
 * A user-customizable mood. The list is ordered best → worst; a mood's numeric
 * "value" for charts is derived from its position (top = highest).
 */
export interface MoodType {
  id: string;
  label: string;
  icon: IconName; // a lucide icon name (see lib/mood.ts)
  color: string; // hex
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD (one entry per day)
  moodId: string; // references MoodType.id
  note: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO datetime
  title: string;
  content: string;
  moodId: string | null; // references MoodType.id
  tags: string[];
}

export type ThemeMode = "light" | "dark" | "system";

export interface Preferences {
  name: string;
  weekStartsMonday: boolean;
  dateFormat: "long" | "short" | "iso";
  dashboardPeriod: "week" | "month" | "year";
  notifications: {
    habitReminders: boolean;
    goalReminders: boolean;
    dailyCheckIn: boolean;
  };
}

export interface AppData {
  habits: Habit[];
  goals: Goal[];
  moods: MoodEntry[];
  journal: JournalEntry[];
  /** User-customizable mood palette, ordered best → worst. */
  moodTypes: MoodType[];
  preferences: Preferences;
  /** Habit ids pinned to the dashboard preview (max 5). Empty = auto (top 5). */
  pinnedHabits: string[];
  version: number;
}
