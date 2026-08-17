import { Angry, Frown, Laugh, Meh, Smile, type LucideIcon } from "lucide-react";
import type { MoodScore } from "@/types";

export interface MoodDef {
  score: MoodScore;
  label: string;
  icon: LucideIcon;
  color: string;
  soft: string;
}

/** Ordered high → low for the vertical selector. */
export const MOODS: MoodDef[] = [
  { score: 5, label: "Great", icon: Laugh, color: "#35B879", soft: "#EAF7F0" },
  { score: 4, label: "Good", icon: Smile, color: "#7FC96A", soft: "#EEF7E6" },
  { score: 3, label: "Okay", icon: Meh, color: "#F6A23A", soft: "#FDF0DF" },
  { score: 2, label: "Low", icon: Frown, color: "#EA8A5B", soft: "#FCEDE3" },
  { score: 1, label: "Bad", icon: Angry, color: "#E8635F", soft: "#FCEAE9" },
];

const MOOD_MAP = MOODS.reduce(
  (acc, m) => ({ ...acc, [m.score]: m }),
  {} as Record<MoodScore, MoodDef>,
);

export function mood(score: MoodScore): MoodDef {
  return MOOD_MAP[score] ?? MOODS[2];
}

export function moodLabel(score: MoodScore): string {
  return mood(score).label;
}
