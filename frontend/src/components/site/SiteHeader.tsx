import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getDashboardTheme } from "@/lib/theme";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/**
 * Site-wide header. Server component — checks if a user is signed in
 * and renders Sign In / Sign Up vs. a profile link. Sticky on scroll.
 *
 * The moon/sun toggle flips the dashboard theme. The header itself
 * stays light on public pages; the toggle's effect is only visible
 * after navigating into a dashboard. From a dashboard, the toggle
 * instantly changes the surrounding dashboard chrome.
 */
export async function SiteHeader() {
  const user = await getCurrentUser();
  const theme = await getDashboardTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            CB
          </div>
          <span className="text-lg font-semibold text-foreground">CareerBridge</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/jobs" className="text-sm text-muted hover:text-foreground">
            Find Jobs
          </Link>
          <Link href="/companies" className="text-sm text-muted hover:text-foreground">
            Companies
          </Link>
          <Link
            href="/register?role=employer"
            className="text-sm text-muted hover:text-foreground"
          >
            Post a Job
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} />
          {user ? (
            <Link
              href={
                user.role === "ADMIN"
                  ? "/admin"
                  : user.role === "EMPLOYER"
                    ? "/employer"
                    : "/dashboard"
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}