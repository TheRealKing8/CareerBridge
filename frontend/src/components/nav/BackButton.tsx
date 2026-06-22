"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Renders a `← Back` button that calls `router.back()`. When the
 * browser's history stack has only one entry (i.e. the user opened
 * this URL directly with no prior page), the button falls back to
 * `router.push(fallbackHref)` so they always have a sensible escape
 * route.
 *
 * We read `window.history.length` lazily on click (not in an effect)
 * to avoid the cascade-render anti-pattern flagged by
 * `react-hooks/set-state-in-effect`. The first click is the only one
 * that needs the value, and reading it then avoids an extra render.
 */
export function BackButton({
  className,
  fallbackHref = "/",
  children,
}: {
  className?: string;
  /** Where to send the user when there's no history to go back to. */
  fallbackHref?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  // Cached on first click so subsequent clicks in the same component
  // lifetime don't keep reading `window`. A ref (not state) so it
  // doesn't trigger a re-render.
  const hasHistoryRef = useRef<boolean | null>(null);

  function handleClick() {
    if (hasHistoryRef.current === null && typeof window !== "undefined") {
      // `history.length` includes the current entry, so a value of 1
      // means "no previous page in this tab."
      hasHistoryRef.current = window.history.length > 1;
    }
    if (hasHistoryRef.current) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        "inline-flex items-center text-xs text-muted hover:text-foreground " +
        (className ?? "")
      }
    >
      {children ?? "← Back"}
    </button>
  );
}
