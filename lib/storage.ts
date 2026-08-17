import type { AppData } from "@/types";
import { buildSeed } from "./seed";

const KEY = "lifeflow:data:v1";
const THEME_KEY = "lifeflow:theme";

/**
 * Centralized persistence layer. Everything funnels through here so a real
 * backend (e.g. Supabase) can replace localStorage without touching UI code.
 */
export function loadData(): AppData {
  if (typeof window === "undefined") return buildSeed();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const seeded = buildSeed();
      saveData(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as AppData;
    return normalize(parsed);
  } catch {
    const seeded = buildSeed();
    saveData(seeded);
    return seeded;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full / unavailable — non-fatal for a local demo */
  }
}

export function resetData(): AppData {
  const seeded = buildSeed();
  saveData(seeded);
  return seeded;
}

export function clearData(): AppData {
  const empty: AppData = {
    habits: [],
    goals: [],
    moods: [],
    journal: [],
    version: 1,
    preferences: buildSeed().preferences,
  };
  saveData(empty);
  return empty;
}

export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(json: string): AppData {
  const parsed = JSON.parse(json) as AppData;
  const normalized = normalize(parsed);
  saveData(normalized);
  return normalized;
}

export function loadTheme(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(THEME_KEY);
}

export function saveTheme(mode: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, mode);
}

/** Fill in any missing fields so older / partial payloads stay valid. */
function normalize(data: Partial<AppData>): AppData {
  const base = buildSeed();
  return {
    habits: data.habits ?? [],
    goals: data.goals ?? [],
    moods: data.moods ?? [],
    journal: data.journal ?? [],
    version: data.version ?? 1,
    preferences: {
      ...base.preferences,
      ...(data.preferences ?? {}),
      notifications: {
        ...base.preferences.notifications,
        ...(data.preferences?.notifications ?? {}),
      },
    },
  };
}
