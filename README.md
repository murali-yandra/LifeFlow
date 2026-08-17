# LifeFlow — Be consistent

A calm, premium personal operating system for **habits, mood, goals, journal, calendar and progress**.
Built to feel like a wellness app you'd actually want to open every day — spacious, soft, and motivating.

> Small actions, repeated consistently, create a better life.

## Highlights

- **8 fully-functional pages** — Dashboard, Habits, Mood, Goals, Calendar, Stats, Journal, Settings.
- **Real, connected data.** Every number (streaks, completion %, totals, goal progress) is *derived* from your activity — nothing is hardcoded. Complete a habit and the streak, radial chart, calendar, stats and dashboard all update together.
- **Radial habit visualization** that scales gracefully from 5 to 20+ habits (concentric rings + scrollable legend).
- **Premium dark mode** (not an inversion) with a persisted theme preference.
- **Fully responsive** — permanent sidebar on desktop, bottom navigation on mobile with a recomposed layout.
- **Local-first persistence** via a single centralized storage layer (`lib/storage.ts`) so a backend like Supabase can drop in later.
- **Polished micro-interactions** — Framer Motion entrance animations, habit-completion springs, goal confetti, animated progress, toasts.

## Tech stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · Recharts · Lucide icons.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first launch the app seeds realistic sample data (15 habits, 6 goals, two weeks of moods and journal entries) so it looks alive immediately.

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Project structure

```
app/            Route segments (dashboard + 7 pages)
components/     Reusable UI, layout, and per-feature components
context/        AppContext (data + mutations), ThemeContext, ToastContext
lib/            calculations, dates, storage, seed, palette, icons, mood
types/          Centralized TypeScript domain model
```

## Data & privacy

All data lives in your browser's `localStorage` under `lifeflow:data:v1`.
Use **Settings → Data** to export a JSON backup, import one, reset to the sample set, or clear everything.
