import {
  Activity,
  Apple,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  CircleDollarSign,
  Droplets,
  Dumbbell,
  Flower2,
  Footprints,
  GlassWater,
  GraduationCap,
  Heart,
  Leaf,
  Moon,
  MountainSnow,
  NotebookPen,
  PersonStanding,
  Salad,
  Smartphone,
  Sparkles,
  Sprout,
  Sun,
  Target,
  Trophy,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/types";

/**
 * Central registry mapping stored icon names → Lucide components.
 * Habits and goals persist only the string name.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  Dumbbell,
  BookOpen,
  Brain,
  GlassWater,
  Droplets,
  Apple,
  Salad,
  Footprints,
  PersonStanding,
  Moon,
  NotebookPen,
  Flower2,
  Sprout,
  GraduationCap,
  Briefcase,
  Utensils,
  Smartphone,
  Sun,
  Sparkles,
  Heart,
  Activity,
  Bike,
  MountainSnow,
  Leaf,
  Target,
  Trophy,
  CircleDollarSign,
  Wallet,
};

/** Ordered list used by the icon picker. */
export const ICON_CHOICES: IconName[] = Object.keys(ICON_MAP);

export function getIcon(name: IconName): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}
