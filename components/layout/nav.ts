import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleCheckBig,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Smile,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CircleCheckBig },
  { href: "/mood", label: "Mood", icon: Smile },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/stats", label: "Stats", icon: ChartNoAxesCombined },
  { href: "/journal", label: "Journal", icon: NotebookPen },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Primary items shown directly in the mobile bottom bar. */
export const MOBILE_NAV: NavItem[] = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[1], // Habits
  NAV_ITEMS[2], // Mood
  NAV_ITEMS[3], // Goals
];

/** Remaining items surfaced behind the mobile "More" menu. */
export const MOBILE_MORE: NavItem[] = [
  NAV_ITEMS[4], // Calendar
  NAV_ITEMS[5], // Stats
  NAV_ITEMS[6], // Journal
  NAV_ITEMS[7], // Settings
];
