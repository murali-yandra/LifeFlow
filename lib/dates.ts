// ── Lightweight date helpers (no external date library) ──────────────────────

const MS_DAY = 86_400_000;

/** Format a Date as a local YYYY-MM-DD key (stable, timezone-safe). */
export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD key into a local Date at midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

/** Whole-day difference a - b (positive if a is later). */
export function diffDays(a: Date, b: Date): number {
  const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((ua - ub) / MS_DAY);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toKey(a) === toKey(b);
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export function isFuture(key: string): boolean {
  return diffDays(fromKey(key), new Date()) > 0;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function daysInMonth(d: Date): number {
  return endOfMonth(d).getDate();
}

/**
 * Return the array of Date cells for a month grid, padded to full weeks.
 * weekStartsMonday shifts the leading offset.
 */
export function monthGrid(d: Date, weekStartsMonday: boolean): Date[] {
  const first = startOfMonth(d);
  const startDow = first.getDay(); // 0 = Sun
  const offset = weekStartsMonday ? (startDow + 6) % 7 : startDow;
  const total = daysInMonth(d);
  const cells: Date[] = [];
  for (let i = 0; i < offset; i++) cells.push(addDays(first, i - offset));
  for (let i = 0; i < total; i++) cells.push(addDays(first, i));
  while (cells.length % 7 !== 0) cells.push(addDays(cells[cells.length - 1], 1));
  return cells;
}

/** The 7 dates of the week containing `d`. */
export function weekDays(d: Date, weekStartsMonday: boolean): Date[] {
  const dow = d.getDay();
  const offset = weekStartsMonday ? (dow + 6) % 7 : dow;
  const start = addDays(d, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function weekdayLabels(weekStartsMonday: boolean): string[] {
  const base = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return weekStartsMonday ? [...base.slice(1), base[0]] : base;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

export function monthName(d: Date): string {
  return MONTHS[d.getMonth()];
}

/** e.g. "August 17, 2026" */
export function formatLong(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** e.g. "Aug 17" */
export function formatMonthDay(d: Date): string {
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** e.g. "August 2026" */
export function formatMonthYear(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatByPref(
  key: string,
  format: "long" | "short" | "iso",
): string {
  const d = fromKey(key);
  if (format === "iso") return key;
  if (format === "short") return formatMonthDay(d);
  return formatLong(d);
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
