"use client";

import { useMemo, useRef, useState } from "react";
import type { Habit } from "@/types";
import { accentBase } from "@/lib/palette";
import { isScheduled } from "@/lib/calculations";
import { diffDays, formatLong, toKey } from "@/lib/dates";
import {
  arcLine,
  computeLayout,
  maxBandsForSize,
  polar,
  sectorPath,
} from "@/lib/radial";
import { cn } from "@/lib/utils";

interface HoverInfo {
  bi: number;
  di: number;
  x: number;
  y: number;
}

/**
 * A radial habit × day grid. Habits are concentric bands (index 0 = outermost),
 * days are angular slices; every intersection is an annular-sector cell painted
 * with the habit's colour when completed. Supports radial scrolling when there
 * are more habit bands than comfortably fit.
 */
export function RadialTracker({
  habits,
  month,
  size = 320,
  interactive = true,
  maxRings,
  onToggle,
  onSurfaceClick,
  showDayLabels = true,
  center,
  className,
  animate = true,
}: {
  habits: Habit[];
  month: Date;
  size?: number;
  interactive?: boolean;
  maxRings?: number;
  onToggle?: (habitId: string, dateKey: string) => void;
  onSurfaceClick?: () => void;
  showDayLabels?: boolean;
  center?: React.ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const year = month.getFullYear();
  const mon = month.getMonth();
  const numDays = new Date(year, mon + 1, 0).getDate();
  const today = new Date();

  const visibleCount = Math.min(
    habits.length,
    maxRings ?? maxBandsForSize(size),
  );
  const canScroll = habits.length > visibleCount;
  const clampedOffset = Math.min(offset, Math.max(0, habits.length - visibleCount));
  const visible = habits.slice(clampedOffset, clampedOffset + visibleCount);

  const layout = useMemo(
    () => computeLayout({ size, numDays, visibleBands: visibleCount }),
    [size, numDays, visibleCount],
  );

  const { cx, cy, outerR, innerR, ringThickness, startAngle, anglePerDay } =
    layout;

  const handleWheel = (e: React.WheelEvent) => {
    if (!canScroll) return;
    e.preventDefault();
    setOffset((o) => {
      const next = o + (e.deltaY > 0 ? 1 : -1);
      return Math.max(0, Math.min(habits.length - visibleCount, next));
    });
  };

  const hovered =
    hover && visible[hover.bi]
      ? {
          habit: visible[hover.bi],
          date: new Date(year, mon, hover.di + 1),
        }
      : null;

  return (
    <div className={cn("relative select-none", className)} ref={wrapRef}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full touch-none"
        onWheel={handleWheel}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Radial habit tracker, ${visible.length} habits`}
      >
        {/* Concentric band separators */}
        {Array.from({ length: visibleCount + 1 }).map((_, i) => (
          <path
            key={`ring-${i}`}
            d={arcLine(cx, cy, outerR - i * ringThickness, startAngle, startAngle + layout.sweep)}
            fill="none"
            stroke="rgb(var(--line))"
            strokeWidth={1}
            strokeOpacity={0.7}
          />
        ))}

        {/* Radial day separators */}
        {Array.from({ length: numDays + 1 }).map((_, i) => {
          const a = startAngle + i * anglePerDay;
          const p1 = polar(cx, cy, innerR, a);
          const p2 = polar(cx, cy, outerR, a);
          return (
            <line
              key={`spoke-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgb(var(--line))"
              strokeWidth={1}
              strokeOpacity={0.55}
            />
          );
        })}

        {/* Cells — a dot per habit×day, with a transparent sector hit area */}
        {visible.map((habit, bi) => {
          const color = accentBase(habit.color);
          const rOut = outerR - bi * ringThickness;
          const rIn = rOut - ringThickness;
          const midR = (rOut + rIn) / 2;
          const completed = new Set(habit.completions);
          // Dot sized to fit both the ring thickness and the angular arc length.
          const arcLen = midR * ((anglePerDay * Math.PI) / 180);
          const dotR = Math.max(1.6, Math.min(9, Math.min(ringThickness, arcLen) * 0.34));

          return Array.from({ length: numDays }).map((_, di) => {
            const date = new Date(year, mon, di + 1);
            const key = toKey(date);
            const done = completed.has(key);
            const future = diffDays(date, today) > 0;
            const scheduled = isScheduled(habit, date);
            const isHover = hover?.bi === bi && hover?.di === di;

            const a1 = startAngle + di * anglePerDay;
            const a2 = startAngle + (di + 1) * anglePerDay;
            const hit = sectorPath(cx, cy, rIn, rOut, a1, a2);
            const c = polar(cx, cy, midR, (a1 + a2) / 2);

            const baseR = done ? dotR : dotR * 0.46;
            const r = isHover ? baseR + 1.6 : baseR;

            return (
              <g key={`${habit.id}-${di}`}>
                <path
                  d={hit}
                  fill="transparent"
                  className={cn(
                    !future && (interactive || onSurfaceClick) && "cursor-pointer",
                  )}
                  onMouseEnter={(e) => {
                    const rect = wrapRef.current?.getBoundingClientRect();
                    setHover({
                      bi,
                      di,
                      x: rect ? e.clientX - rect.left : 0,
                      y: rect ? e.clientY - rect.top : 0,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = wrapRef.current?.getBoundingClientRect();
                    setHover((h) =>
                      h ? { ...h, x: rect ? e.clientX - rect.left : 0, y: rect ? e.clientY - rect.top : 0 } : h,
                    );
                  }}
                  onClick={() => {
                    if (future) return;
                    if (interactive && onToggle) onToggle(habit.id, key);
                    else onSurfaceClick?.();
                  }}
                />
                <circle
                  className={animate ? "radial-dot" : undefined}
                  cx={c.x}
                  cy={c.y}
                  r={r}
                  fill={done ? color : "rgb(var(--ink-muted))"}
                  fillOpacity={done ? (future ? 0.4 : 1) : scheduled ? 0.3 : 0.14}
                  stroke={isHover ? color : "none"}
                  strokeWidth={isHover ? 1.5 : 0}
                  style={{
                    pointerEvents: "none",
                    transition: "r 0.12s ease-out",
                    animationDelay: animate ? `${(di * 0.016 + bi * 0.014).toFixed(3)}s` : undefined,
                  }}
                />
              </g>
            );
          });
        })}

        {/* Day labels around the outside */}
        {showDayLabels &&
          Array.from({ length: numDays }).map((_, di) => {
            const a = startAngle + (di + 0.5) * anglePerDay;
            const p = polar(cx, cy, outerR + 12, a);
            const isToday =
              toKey(new Date(year, mon, di + 1)) === toKey(today);
            // Only label every day when they fit; otherwise every 2nd/5th.
            const stepEvery = anglePerDay >= 9 ? 1 : anglePerDay >= 5 ? 2 : 5;
            if (di % stepEvery !== 0 && di !== numDays - 1) return null;
            return (
              <text
                key={`lbl-${di}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={size < 300 ? 8 : 9.5}
                fontWeight={isToday ? 700 : 500}
                fill={isToday ? accentBase("green") : "rgb(var(--ink-muted))"}
              >
                {di + 1}
              </text>
            );
          })}

        {/* Centre */}
        {center && (
          <foreignObject
            x={cx - innerR * 0.82}
            y={cy - innerR * 0.82}
            width={innerR * 1.64}
            height={innerR * 1.64}
          >
            <div className="grid h-full w-full place-items-center text-center">
              {center}
            </div>
          </foreignObject>
        )}
      </svg>

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-pop"
          style={{ left: hover!.x, top: hover!.y }}
        >
          <div className="font-semibold text-ink">{formatLong(hovered.date)}</div>
          <div className="flex items-center gap-1.5 text-ink-soft">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: accentBase(hovered.habit.color) }}
            />
            {hovered.habit.name}
            <span
              className="ml-1 font-medium"
              style={{
                color: hovered.habit.completions.includes(toKey(hovered.date))
                  ? accentBase("green")
                  : "rgb(var(--ink-muted))",
              }}
            >
              {hovered.habit.completions.includes(toKey(hovered.date))
                ? "✓ Done"
                : "—"}
            </span>
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      {canScroll && (
        <div className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface/90 px-2.5 py-0.5 text-[11px] font-medium text-ink-muted shadow-sm">
          {clampedOffset + 1}–{clampedOffset + visible.length} of {habits.length} habits
        </div>
      )}
    </div>
  );
}
