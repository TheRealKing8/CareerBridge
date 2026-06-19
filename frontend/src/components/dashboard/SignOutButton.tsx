"use client";

import { signOut } from "next-auth/react";

/**
 * Sign-out button. Calls NextAuth v4's `signOut()` with a callback to
 * the marketing site root. Used in the dashboard topbar.
 */
export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-card"
    >
      Sign out
    </button>
  );
}