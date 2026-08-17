import {
  Angry,
  Annoyed,
  BatteryLow,
  Brain,
  Cloud,
  CloudRain,
  Coffee,
  Flame,
  Frown,
  Heart,
  Laugh,
  Meh,
  Moon,
  PartyPopper,
  Smile,
  SmilePlus,
  Sparkles,
  Star,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { MoodType } from "@/types";

/** Icons available in the mood editor (emotion / weather / energy themed). */
export const MOOD_ICON_MAP: Record<string, LucideIcon> = {
  Laugh,
  SmilePlus,
  Smile,
  Meh,
  Frown,
  Annoyed,
  Angry,
  Heart,
  Star,
  Sparkles,
  PartyPopper,
  Sun,
  Cloud,
  CloudRain,
  Moon,
  Zap,
  Flame,
  Coffee,
  Brain,
  BatteryLow,
};

export const MOOD_ICON_CHOICES = Object.keys(MOOD_ICON_MAP);

export function getMoodIcon(name: string): LucideIcon {
  return MOOD_ICON_MAP[name] ?? Smile;
}

/** Preset colors offered in the mood editor. */
export const MOOD_COLORS = [
  "#35B879",
  "#7FC96A",
  "#2FB6B6",
  "#4295E8",
  "#6C74E4",
  "#9B7AEA",
  "#F6A23A",
  "#EA8A5B",
  "#EA6EA7",
  "#E8635F",
  "#D9B23C",
  "#9CA3AF",
];

export const DEFAULT_MOOD_TYPES: MoodType[] = [
  { id: "mood-great", label: "Great", icon: "Laugh", color: "#35B879" },
  { id: "mood-good", label: "Good", icon: "Smile", color: "#7FC96A" },
  { id: "mood-okay", label: "Okay", icon: "Meh", color: "#F6A23A" },
  { id: "mood-low", label: "Low", icon: "Frown", color: "#EA8A5B" },
  { id: "mood-bad", label: "Bad", icon: "Angry", color: "#E8635F" },
];

/**
 * Numeric value used to place a mood on the trend chart's Y-axis.
 * Top of the list = highest value.
 */
export function moodValue(types: MoodType[] | undefined, id: string): number {
  if (!types || types.length === 0) return 0;
  const idx = types.findIndex((t) => t.id === id);
  return idx === -1 ? 0 : types.length - idx;
}

export function findMoodType(
  types: MoodType[] | undefined,
  id: string | null | undefined,
): MoodType | undefined {
  if (!types || !id) return undefined;
  return types.find((t) => t.id === id);
}

/** Soft background tint from a hex color (~13% alpha). */
export function moodSoft(color: string): string {
  return `${color}22`;
}

/** Migrate a legacy numeric mood value (1 Bad … 5 Great) to a default id. */
export function legacyValueToId(v: number): string {
  const map: Record<number, string> = {
    5: "mood-great",
    4: "mood-good",
    3: "mood-okay",
    2: "mood-low",
    1: "mood-bad",
  };
  return map[v] ?? "mood-okay";
}
