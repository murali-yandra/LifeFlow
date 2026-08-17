"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { MOBILE_MORE, MOBILE_NAV } from "./nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MOBILE_MORE.some((i) => isActive(pathname, i.href));

  return (
    <>
      {/* Slide-up "More" sheet */}
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-pop"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
              <div className="mb-1 px-1 text-sm font-semibold text-ink">More</div>
              <div className="grid grid-cols-4 gap-2">
                {MOBILE_MORE.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-2xl border px-2 py-3.5 text-[12px] font-medium transition-colors",
                        active
                          ? "border-transparent bg-brand-soft text-brand"
                          : "border-line text-ink-soft hover:bg-surface-2",
                      )}
                    >
                      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
          {MOBILE_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10.5px] font-medium transition-colors",
                  active ? "text-brand" : "text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-full max-w-[64px] place-items-center rounded-xl transition-colors",
                    active && "bg-brand-soft",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </span>
                {item.label}
              </Link>
            );
          })}

          {/* More */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="More pages"
            aria-expanded={moreOpen}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10.5px] font-medium transition-colors",
              moreOpen || moreActive ? "text-brand" : "text-ink-muted",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-full max-w-[64px] place-items-center rounded-xl transition-colors",
                (moreOpen || moreActive) && "bg-brand-soft",
              )}
            >
              <MoreHorizontal size={20} strokeWidth={moreOpen || moreActive ? 2.4 : 2} />
            </span>
            More
          </button>
        </div>
      </nav>
    </>
  );
}
