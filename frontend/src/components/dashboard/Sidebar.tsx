"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/session";

export type NavItem = {
  href: string;
  label: string;
};

/**
 * Role-specific sidebar. Highlights the active item via `usePathname()`.
 * Renders as a flex column inside `DashboardShell`; on mobile it's
 * wrapped in a slide-in drawer (managed by the parent).
 */
export function Sidebar({
  user,
  items,
}: {
  user: CurrentUser;
  items: readonly NavItem[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          CB
        </div>
        <span className="text-sm font-semibold">CareerBridge</span>
      </div>

      <ul className="flex-1 space-y-1">
        {items.map((item) => {
          // For the index page (e.g. /dashboard) we need an exact match;
          // for sub-pages we want prefix match.
          const isActive =
            item.href === pathname ||
            (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-card hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-lg border border-border bg-background p-3 text-xs text-muted">
        Signed in as
        <div className="mt-1 truncate font-medium text-foreground">
          {user.fullName || user.email}
        </div>
        <div className="mt-0.5">{user.role}</div>
      </div>
    </nav>
  );
}