"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, type NavItem } from "./Sidebar";
import { SignOutButton } from "./SignOutButton";
import { BackButton } from "@/components/nav/BackButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { CurrentUser } from "@/lib/session";
import type { DashboardTheme } from "@/lib/theme";

/**
 * Dashboard chrome: sidebar (left) + topbar (top) + content slot.
 *
 * Client component because it manages the mobile drawer state and the
 * sidebar uses `usePathname()` for active-link highlighting.
 *
 * Each role's `layout.tsx` calls `requireRole(...)` to get a typed
 * `user` and passes the role-specific `items` list. The current
 * dashboard theme is also passed in so the toggle button's icon
 * matches the actual theme on first paint.
 */
export function DashboardShell({
  user,
  items,
  titlePrefix,
  theme,
  children,
}: {
  user: CurrentUser;
  items: readonly NavItem[];
  titlePrefix: string;
  theme: DashboardTheme;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  // The Home button jumps to the public home (/). On a dashboard root
  // (e.g. /admin, /employer, /dashboard) that would be a step backwards
  // in context, so suppress it. On nested pages it gives the user a
  // quick way out of the dashboard.
  const DASHBOARD_ROOTS = ["/admin", "/employer", "/dashboard"] as const;
  const isDashboardRoot = (DASHBOARD_ROOTS as readonly string[]).includes(
    pathname,
  );

  // Close the drawer on route change. We watch the pathname via a
  // custom event the layout doesn't dispatch — simpler to just close on
  // any click on a link (handled inline below). For now we also close
  // when the window resizes to a wider viewport, to avoid the drawer
  // staying open after rotation.
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setIsOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Topbar (mobile) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg border border-border bg-background p-2 hover:bg-card"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span className="text-sm font-semibold">{titlePrefix} Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} />
          <SignOutButton />
        </div>
      </header>

      {/* Desktop topbar (right-aligned user + sign-out) */}
      <header className="sticky top-0 z-20 hidden h-14 items-center justify-end border-b border-border bg-card/90 px-6 backdrop-blur lg:flex">
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} />
          <div className="text-right text-sm">
            <div className="font-medium text-foreground">
              {user.fullName || user.email}
            </div>
            <div className="text-xs text-muted">{user.role}</div>
          </div>
          <SignOutButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
          <Sidebar user={user} items={items} />
        </aside>

        {/* Mobile drawer */}
        {isOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">
              <div onClick={() => setIsOpen(false)}>
                <Sidebar user={user} items={items} />
              </div>
            </aside>
          </div>
        ) : null}

        {/* Main content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex items-center gap-4">
              <BackButton>← Back</BackButton>
              {isDashboardRoot ? null : (
                <Link
                  href="/"
                  className="inline-flex items-center text-xs text-muted hover:text-foreground"
                >
                  Home
                </Link>
              )}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}