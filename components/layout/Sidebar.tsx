"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Leaf } from "lucide-react";
import { NAV_ITEMS } from "./nav";
import { useApp } from "@/context/AppContext";
import { cn, initials } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useApp();
  const name = data.preferences.name || "You";

  return (
    <aside className="sticky top-0 hidden h-screen w-[252px] shrink-0 flex-col p-3 lg:flex">
      <div className="flex h-full flex-col rounded-3xl border border-line bg-surface/70 p-4">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 pb-2 pt-1.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Leaf size={22} strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-semibold tracking-tight text-ink">
              LifeFlow
            </div>
            <div className="text-xs text-ink-muted">Be consistent</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-all duration-150",
                  active
                    ? "bg-brand-soft text-brand"
                    : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                )}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.4 : 2}
                  className={cn(
                    "transition-colors",
                    active ? "text-brand" : "text-ink-muted group-hover:text-ink",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <button className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 text-left transition-colors hover:bg-surface-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-teal-400 text-[13px] font-semibold text-white">
            {initials(name)}
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-sm font-semibold text-ink">
              {name}
            </span>
            <span className="block truncate text-xs text-ink-muted">
              Keep going!
            </span>
          </span>
          <ChevronsUpDown size={15} className="text-ink-muted" />
        </button>
      </div>
    </aside>
  );
}
