"use client";

import { Leaf } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";

/**
 * App-wide chrome: permanent sidebar on desktop, a compact brand bar plus a
 * bottom nav on mobile. Pages render their own PageHeader inside {children}.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile brand bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
              <Leaf size={20} strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-ink">LifeFlow</div>
              <div className="text-[11px] text-ink-muted">Be consistent</div>
            </div>
          </div>
          <NotificationBell />
        </div>

        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
