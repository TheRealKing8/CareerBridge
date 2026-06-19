"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Moon/sun toggle for the dashboard theme.
 *
 * The current theme is passed in from the server-rendered parent so
 * the icon matches the actual theme on first paint (no flash). On
 * click we POST to `/api/theme`, then refresh server data so the
 * cookie change takes effect immediately for subsequent navigations.
 *
 * The pre-paint inline script in the root layout also reads the same
 * cookie and updates `data-theme` synchronously, which means the
 * toggle feels instant on next navigation even before the refresh
 * round-trip completes.
 */
export function ThemeToggle({
  theme,
  className = "",
  label = "Toggle dashboard theme",
}: {
  theme: "dark" | "light";
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<"dark" | "light">(theme);

  async function toggle() {
    const next = optimistic === "dark" ? "light" : "dark";
    setOptimistic(next);
    // Update the DOM immediately so the change is visible while the
    // server round-trip is in flight. The inline script's logic runs
    // again on the next navigation, so the cookie stays in sync.
    document.documentElement.dataset.dashTheme = next;
    try {
      await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: next }),
      });
    } catch {
      // Network failures are fine — the next reload will resync.
    }
    startTransition(() => router.refresh());
  }

  const isDark = optimistic === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={label}
      title={label}
      className={
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60 " +
        className
      }
    >
      {isDark ? (
        // Moon — currently dark, click to go light
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        // Sun — currently light, click to go dark
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.93 4.93l1.41 1.41" />
          <path d="M17.66 17.66l1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M6.34 17.66l-1.41 1.41" />
          <path d="M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}