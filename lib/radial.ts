// ── Radial habit-grid geometry ───────────────────────────────────────────────
// A radial tracker is a habit × day grid wrapped around a circle:
//   • angular dimension = days   (each day is an angular slice)
//   • radial dimension  = habits (each habit is a concentric band)
// Every habit×day intersection is a small annular-sector "cell".

/** Convert a polar coordinate to cartesian. deg 0 = top, increasing clockwise. */
export function polar(cx: number, cy: number, r: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(t), y: cy - r * Math.cos(t) };
}

/**
 * SVG path for an annular sector (a curved "cell") between two radii and two
 * angles. Angles are in degrees, clockwise, deg2 > deg1.
 */
export function sectorPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  deg1: number,
  deg2: number,
): string {
  const largeArc = deg2 - deg1 > 180 ? 1 : 0;
  const p1 = polar(cx, cy, rInner, deg1);
  const p2 = polar(cx, cy, rOuter, deg1);
  const p3 = polar(cx, cy, rOuter, deg2);
  const p4 = polar(cx, cy, rInner, deg2);
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `L ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `L ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

/** A pure arc path (no fill area) at a single radius, used for grid lines. */
export function arcLine(
  cx: number,
  cy: number,
  r: number,
  deg1: number,
  deg2: number,
): string {
  const largeArc = deg2 - deg1 > 180 ? 1 : 0;
  const a = polar(cx, cy, r, deg1);
  const b = polar(cx, cy, r, deg2);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

export interface RadialLayout {
  size: number;
  cx: number;
  cy: number;
  innerR: number;
  outerR: number;
  ringThickness: number;
  startAngle: number;
  sweep: number;
  anglePerDay: number;
  /** Angular / radial padding as a fraction of the slot (0–0.5). */
  gap: number;
}

export interface LayoutInput {
  size: number;
  numDays: number;
  visibleBands: number;
  /** Fraction of radius reserved for the open centre (0–1). */
  centerRatio?: number;
  labelMargin?: number;
  startAngle?: number;
  sweep?: number;
}

export function computeLayout({
  size,
  numDays,
  visibleBands,
  centerRatio = 0.34,
  labelMargin = 24,
  startAngle = 15,
  sweep = 330,
}: LayoutInput): RadialLayout {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - labelMargin;
  const innerR = outerR * centerRatio;
  const ringThickness = (outerR - innerR) / Math.max(visibleBands, 1);
  return {
    size,
    cx,
    cy,
    innerR,
    outerR,
    ringThickness,
    startAngle,
    sweep,
    anglePerDay: sweep / Math.max(numDays, 1),
    gap: 0.16,
  };
}

/** Number of habit bands that keep a usable (clickable) ring thickness. */
export function maxBandsForSize(
  size: number,
  centerRatio = 0.34,
  labelMargin = 24,
  minThickness = 12,
): number {
  const outerR = size / 2 - labelMargin;
  const innerR = outerR * centerRatio;
  return Math.max(1, Math.floor((outerR - innerR) / minThickness));
}
