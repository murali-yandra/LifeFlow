"use client";

import { useRef, useState } from "react";
import {
  Download,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";
import type { ThemeMode } from "@/types";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    data,
    hydrated,
    updatePreferences,
    resetAll,
    clearAll,
    exportJson,
    importJson,
  } = useApp();
  const { mode, setMode } = useTheme();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!hydrated) return <PageSkeleton />;

  const prefs = data.preferences;

  const doExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Data exported");
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
        toast("Data imported");
      } catch {
        toast("Couldn't read that file", "error");
      }
    };
    reader.readAsText(file);
  };

  const themes: { value: ThemeMode; label: string; icon: any }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Make LifeFlow yours." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader title="Profile" />
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-teal-400 text-xl font-bold text-white">
              {initials(prefs.name || "You")}
            </span>
            <div className="flex-1">
              <Field label="Display name">
                <Input
                  value={prefs.name}
                  onChange={(e) => updatePreferences({ name: e.target.value })}
                  placeholder="Your name"
                />
              </Field>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-muted">
            Your avatar is generated from your initials — no external service.
          </p>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader title="Appearance" />
          <div className="grid grid-cols-3 gap-2.5">
            {themes.map((t) => {
              const active = mode === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setMode(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line text-ink-soft hover:bg-surface-2",
                  )}
                >
                  <t.icon size={22} />
                  <span className="text-[13px] font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader title="Notifications" />
          <div className="space-y-1">
            <Toggle
              label="Habit reminders"
              hint="Nudge me about habits I haven't completed."
              on={prefs.notifications.habitReminders}
              onChange={(v) =>
                updatePreferences({
                  notifications: { ...prefs.notifications, habitReminders: v },
                })
              }
            />
            <Toggle
              label="Goal reminders"
              hint="Remind me about approaching deadlines."
              on={prefs.notifications.goalReminders}
              onChange={(v) =>
                updatePreferences({
                  notifications: { ...prefs.notifications, goalReminders: v },
                })
              }
            />
            <Toggle
              label="Daily check-in"
              hint="A gentle prompt to log my mood each day."
              on={prefs.notifications.dailyCheckIn}
              onChange={(v) =>
                updatePreferences({
                  notifications: { ...prefs.notifications, dailyCheckIn: v },
                })
              }
            />
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader title="Preferences" />
          <div className="space-y-4">
            <Field label="Week starts on">
              <Select
                value={prefs.weekStartsMonday ? "mon" : "sun"}
                onChange={(e) =>
                  updatePreferences({ weekStartsMonday: e.target.value === "mon" })
                }
              >
                <option value="sun">Sunday</option>
                <option value="mon">Monday</option>
              </Select>
            </Field>
            <Field label="Date format">
              <Select
                value={prefs.dateFormat}
                onChange={(e) =>
                  updatePreferences({ dateFormat: e.target.value as any })
                }
              >
                <option value="long">August 17, 2026</option>
                <option value="short">Aug 17</option>
                <option value="iso">2026-08-17</option>
              </Select>
            </Field>
            <Field label="Default dashboard period">
              <Select
                value={prefs.dashboardPeriod}
                onChange={(e) =>
                  updatePreferences({ dashboardPeriod: e.target.value as any })
                }
              >
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </Select>
            </Field>
          </div>
        </Card>

        {/* Data */}
        <Card className="lg:col-span-2">
          <CardHeader title="Data" />
          <p className="mb-4 text-sm text-ink-soft">
            Your data lives entirely in this browser. Export a backup, import one,
            or start fresh at any time.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={doExport}>
              <Download size={16} /> Export Data
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Import Data
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doImport(f);
                e.target.value = "";
              }}
            />
            <Button variant="secondary" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={16} /> Reset to Sample
            </Button>
            <Button variant="danger" onClick={() => setConfirmClear(true)}>
              <Trash2 size={16} /> Clear Everything
            </Button>
          </div>
        </Card>
      </div>

      <p className="mt-8 text-center text-xs text-ink-muted">
        LifeFlow · Be consistent · Small actions, repeated consistently, create a
        better life.
      </p>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetAll();
          toast("Reset to sample data");
        }}
        title="Reset to sample data?"
        message="This replaces your current data with the original LifeFlow sample set."
        confirmLabel="Reset"
        destructive={false}
      />

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          toast("All data cleared", "info");
        }}
        title="Clear everything?"
        message="This permanently deletes all habits, goals, moods and journal entries. This can't be undone."
        confirmLabel="Clear all"
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-muted">{hint}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          on ? "bg-brand" : "bg-surface-2 border border-line",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}
