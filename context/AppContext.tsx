"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppData,
  Goal,
  Habit,
  JournalEntry,
  MoodEntry,
  MoodScore,
  Preferences,
} from "@/types";
import {
  clearData,
  exportData,
  importData,
  loadData,
  resetData,
  saveData,
} from "@/lib/storage";
import { toKey } from "@/lib/dates";
import { uid } from "@/lib/utils";

interface AppCtx {
  data: AppData;
  hydrated: boolean;

  // habits
  addHabit: (h: Omit<Habit, "id" | "createdAt" | "completions">) => Habit;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, dateKey: string) => boolean;

  // goals
  addGoal: (g: Omit<Goal, "id" | "createdAt" | "history">) => Goal;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  setGoalProgress: (id: string, current: number) => void;

  // mood
  setMood: (dateKey: string, mood: MoodScore, note: string) => void;
  deleteMood: (dateKey: string) => void;

  // journal
  addJournal: (j: Omit<JournalEntry, "id">) => JournalEntry;
  updateJournal: (id: string, patch: Partial<JournalEntry>) => void;
  deleteJournal: (id: string) => void;

  // preferences + data
  updatePreferences: (patch: Partial<Preferences>) => void;
  resetAll: () => void;
  clearAll: () => void;
  exportJson: () => string;
  importJson: (json: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [hydrated, setHydrated] = useState(false);

  // Re-read from storage on mount to sync with the client value (SSR safety).
  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  // Persist on every change once hydrated.
  const commit = useCallback((next: AppData) => {
    setData(next);
    saveData(next);
  }, []);

  // ── Habits ──────────────────────────────────────────────────────────────
  const addHabit = useCallback<AppCtx["addHabit"]>(
    (h) => {
      const habit: Habit = {
        ...h,
        id: uid("habit"),
        createdAt: toKey(new Date()),
        completions: [],
      };
      setData((d) => {
        const next = { ...d, habits: [...d.habits, habit] };
        saveData(next);
        return next;
      });
      return habit;
    },
    [],
  );

  const updateHabit = useCallback<AppCtx["updateHabit"]>((id, patch) => {
    setData((d) => {
      const next = {
        ...d,
        habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      };
      saveData(next);
      return next;
    });
  }, []);

  const deleteHabit = useCallback<AppCtx["deleteHabit"]>((id) => {
    setData((d) => {
      const next = { ...d, habits: d.habits.filter((h) => h.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  /** Toggle a completion; returns the new completed state. */
  const toggleCompletion = useCallback<AppCtx["toggleCompletion"]>(
    (id, dateKey) => {
      let nowCompleted = false;
      setData((d) => {
        const habits = d.habits.map((h) => {
          if (h.id !== id) return h;
          const has = h.completions.includes(dateKey);
          nowCompleted = !has;
          return {
            ...h,
            completions: has
              ? h.completions.filter((k) => k !== dateKey)
              : [...h.completions, dateKey].sort(),
          };
        });
        const next = { ...d, habits };
        saveData(next);
        return next;
      });
      return nowCompleted;
    },
    [],
  );

  // ── Goals ───────────────────────────────────────────────────────────────
  const addGoal = useCallback<AppCtx["addGoal"]>((g) => {
    const goal: Goal = {
      ...g,
      id: uid("goal"),
      createdAt: toKey(new Date()),
      history: [{ date: toKey(new Date()), value: g.current }],
    };
    setData((d) => {
      const next = { ...d, goals: [...d.goals, goal] };
      saveData(next);
      return next;
    });
    return goal;
  }, []);

  const updateGoal = useCallback<AppCtx["updateGoal"]>((id, patch) => {
    setData((d) => {
      const next = {
        ...d,
        goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
      };
      saveData(next);
      return next;
    });
  }, []);

  const deleteGoal = useCallback<AppCtx["deleteGoal"]>((id) => {
    setData((d) => {
      const next = { ...d, goals: d.goals.filter((g) => g.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  const setGoalProgress = useCallback<AppCtx["setGoalProgress"]>(
    (id, current) => {
      setData((d) => {
        const goals = d.goals.map((g) => {
          if (g.id !== id) return g;
          const clamped = Math.max(0, Math.min(g.target, current));
          const today = toKey(new Date());
          const history = [...g.history.filter((h) => h.date !== today), { date: today, value: clamped }];
          return { ...g, current: clamped, history };
        });
        const next = { ...d, goals };
        saveData(next);
        return next;
      });
    },
    [],
  );

  // ── Mood ────────────────────────────────────────────────────────────────
  const setMood = useCallback<AppCtx["setMood"]>((dateKey, moodScore, note) => {
    setData((d) => {
      const existing = d.moods.find((m) => m.date === dateKey);
      const moods = existing
        ? d.moods.map((m) =>
            m.date === dateKey ? { ...m, mood: moodScore, note } : m,
          )
        : [...d.moods, { id: uid("mood"), date: dateKey, mood: moodScore, note }];
      const next = { ...d, moods };
      saveData(next);
      return next;
    });
  }, []);

  const deleteMood = useCallback<AppCtx["deleteMood"]>((dateKey) => {
    setData((d) => {
      const next = { ...d, moods: d.moods.filter((m) => m.date !== dateKey) };
      saveData(next);
      return next;
    });
  }, []);

  // ── Journal ─────────────────────────────────────────────────────────────
  const addJournal = useCallback<AppCtx["addJournal"]>((j) => {
    const entry: JournalEntry = { ...j, id: uid("jr") };
    setData((d) => {
      const next = { ...d, journal: [entry, ...d.journal] };
      saveData(next);
      return next;
    });
    return entry;
  }, []);

  const updateJournal = useCallback<AppCtx["updateJournal"]>((id, patch) => {
    setData((d) => {
      const next = {
        ...d,
        journal: d.journal.map((j) => (j.id === id ? { ...j, ...patch } : j)),
      };
      saveData(next);
      return next;
    });
  }, []);

  const deleteJournal = useCallback<AppCtx["deleteJournal"]>((id) => {
    setData((d) => {
      const next = { ...d, journal: d.journal.filter((j) => j.id !== id) };
      saveData(next);
      return next;
    });
  }, []);

  // ── Preferences + data ──────────────────────────────────────────────────
  const updatePreferences = useCallback<AppCtx["updatePreferences"]>((patch) => {
    setData((d) => {
      const next = { ...d, preferences: { ...d.preferences, ...patch } };
      saveData(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => setData(resetData()), []);
  const clearAll = useCallback(() => setData(clearData()), []);
  const exportJson = useCallback(() => exportData(data), [data]);
  const importJson = useCallback<AppCtx["importJson"]>((json) => {
    setData(importData(json));
  }, []);

  const value = useMemo<AppCtx>(
    () => ({
      data,
      hydrated,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      addGoal,
      updateGoal,
      deleteGoal,
      setGoalProgress,
      setMood,
      deleteMood,
      addJournal,
      updateJournal,
      deleteJournal,
      updatePreferences,
      resetAll,
      clearAll,
      exportJson,
      importJson,
    }),
    [
      data,
      hydrated,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleCompletion,
      addGoal,
      updateGoal,
      deleteGoal,
      setGoalProgress,
      setMood,
      deleteMood,
      addJournal,
      updateJournal,
      deleteJournal,
      updatePreferences,
      resetAll,
      clearAll,
      exportJson,
      importJson,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
