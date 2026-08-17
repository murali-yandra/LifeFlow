import type { AccentColor } from "@/types";

export interface AccentDef {
  key: AccentColor;
  label: string;
  /** Main solid color (hex). */
  base: string;
  /** Soft tinted background for light mode. */
  soft: string;
  /** Soft tinted background for dark mode. */
  softDark: string;
}

/**
 * Fixed pastel accent palette. Deliberately calm — no neon.
 * Order matters: habits without an explicit color cycle through this list.
 */
export const ACCENTS: AccentDef[] = [
  { key: "green", label: "Green", base: "#35B879", soft: "#EAF7F0", softDark: "#12271E" },
  { key: "blue", label: "Blue", base: "#4295E8", soft: "#E7F1FC", softDark: "#12233A" },
  { key: "purple", label: "Purple", base: "#9B7AEA", soft: "#F0EBFC", softDark: "#221B39" },
  { key: "orange", label: "Orange", base: "#F6A23A", soft: "#FDF0DF", softDark: "#33240F" },
  { key: "pink", label: "Pink", base: "#EA6EA7", soft: "#FCE9F2", softDark: "#331222" },
  { key: "teal", label: "Teal", base: "#2FB6B6", soft: "#E2F6F6", softDark: "#0E2A2A" },
  { key: "red", label: "Red", base: "#E8635F", soft: "#FCEAE9", softDark: "#331516" },
  { key: "amber", label: "Amber", base: "#D9B23C", soft: "#FBF3DA", softDark: "#2E2710" },
  { key: "indigo", label: "Indigo", base: "#6C74E4", soft: "#EAEBFC", softDark: "#191C3A" },
  { key: "rose", label: "Rose", base: "#DB6C8C", soft: "#FBE9EE", softDark: "#331620" },
];

const ACCENT_MAP: Record<AccentColor, AccentDef> = ACCENTS.reduce(
  (acc, a) => ({ ...acc, [a.key]: a }),
  {} as Record<AccentColor, AccentDef>,
);

export function accent(color: AccentColor): AccentDef {
  return ACCENT_MAP[color] ?? ACCENTS[0];
}

export function accentBase(color: AccentColor): string {
  return accent(color).base;
}

/** Deterministically pick an accent by index (used for auto-coloring). */
export function accentByIndex(index: number): AccentColor {
  return ACCENTS[index % ACCENTS.length].key;
}
