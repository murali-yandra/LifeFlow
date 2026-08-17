"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ACCENTS } from "@/lib/palette";

/**
 * Tiny, dependency-free celebration burst. Renders a spray of particles from
 * the centre of its relatively-positioned parent, then removes itself.
 */
export function Confetti({ fire }: { fire: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (fire) {
      setShow(true);
      const t = setTimeout(() => setShow(false), 1400);
      return () => clearTimeout(t);
    }
  }, [fire]);

  const pieces = Array.from({ length: 26 }, (_, i) => i);

  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {pieces.map((i) => {
            const angle = (i / pieces.length) * Math.PI * 2;
            const dist = 60 + Math.random() * 70;
            const color = ACCENTS[i % ACCENTS.length].base;
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: color }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist - 10,
                  opacity: 0,
                  scale: 0.4,
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
