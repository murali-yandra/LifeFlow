import type { AppData } from "@/types";
import { buildSeed } from "./seed";
import { DEFAULT_MOOD_TYPES, legacyValueToId } from "./mood";

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
    moodTypes: DEFAULT_MOOD_TYPES,
    pinnedHabits: [],
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
  const moodTypes =
    data.moodTypes && data.moodTypes.length > 0
      ? data.moodTypes
      : DEFAULT_MOOD_TYPES;

  // Migrate mood entries: old shape stored a numeric `mood`; new stores `moodId`.
  const moods = (data.moods ?? []).map((m) => {
    const anyM = m as unknown as { moodId?: string; mood?: number };
    return {
      id: m.id,
      date: m.date,
      note: m.note ?? "",
      moodId: anyM.moodId ?? legacyValueToId(anyM.mood ?? 3),
    };
  });

  const journal = (data.journal ?? []).map((j) => {
    const anyJ = j as unknown as { moodId?: string | null; mood?: number | null };
    const moodId =
      anyJ.moodId !== undefined
        ? anyJ.moodId
        : typeof anyJ.mood === "number"
          ? legacyValueToId(anyJ.mood)
          : null;
    return {
      id: j.id,
      date: j.date,
      title: j.title,
      content: j.content,
      tags: j.tags ?? [],
      moodId,
    };
  });

  return {
    habits: data.habits ?? [],
    goals: data.goals ?? [],
    moods,
    journal,
    moodTypes,
    pinnedHabits: data.pinnedHabits ?? [],
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
