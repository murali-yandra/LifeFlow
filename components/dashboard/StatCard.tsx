"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  value,
  label,
  hint,
  tint,
  index = 0,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint: string;
  tint: "green" | "blue" | "orange" | "purple";
  index?: number;
}) {
  const tints: Record<string, string> = {
    green: "bg-brand-soft text-brand",
    blue: "bg-blue-100 text-blue-500 dark:bg-blue-500/15 dark:text-blue-400",
    orange: "bg-orange-100 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-500 dark:bg-purple-500/15 dark:text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
    >
      <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", tints[tint])}>
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <div className="text-[26px] font-bold leading-none tracking-tight text-ink">
          {value}
        </div>
        <div className="mt-1.5 text-[13px] font-medium text-ink-soft">{label}</div>
        <div className="text-xs text-ink-muted">{hint}</div>
      </div>
    </motion.div>
  );
}
