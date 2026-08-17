/** Join truthy class names. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Reasonably-unique id without external deps. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** Format a number with thousands separators. */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

/** Format a goal value honoring currency prefix / unit suffix. */
export function formatGoalValue(
  value: number,
  unit: string,
  unitPrefix?: boolean,
): string {
  if (unitPrefix && unit) return `${unit}${formatNumber(value)}`;
  if (unit) return `${formatNumber(value)} ${unit}`;
  return formatNumber(value);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
