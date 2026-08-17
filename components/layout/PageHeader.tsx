"use client";

import { motion } from "framer-motion";

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[15px] text-ink-soft">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center gap-2.5">{right}</div>}
    </motion.header>
  );
}
