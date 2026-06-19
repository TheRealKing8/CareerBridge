/**
 * Email-verification banner.
 *
 * Renders only for authenticated users whose email is not yet
 * verified. Shown across public routes and dashboards via the root
 * layout. Clicking "Resend" POSTs to /api/auth/verify.
 */
"use client";

import { useState } from "react";

export function EmailVerificationBanner({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function resend() {
    setBusy(true);
    setMsg(null);
    setDevUrl(null);
    try {
      const res = await fetch("/api/auth/verify", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        devUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setMsg(data.error ?? "Could not resend.");
      } else {
        setMsg("Verification email sent.");
        setDevUrl(data.devUrl ?? null);
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
        <span>
          Please verify <strong>{email}</strong> to unlock job applications and posting.
        </span>
        <div className="flex items-center gap-3">
          {msg ? <span className="text-xs">{msg}</span> : null}
          <button
            type="button"
            disabled={busy}
            onClick={resend}
            className="rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Sending…" : "Resend link"}
          </button>
        </div>
      </div>
      {devUrl ? (
        <div className="mx-auto mt-1 max-w-7xl break-all text-xs">
          Dev mode: <a className="underline" href={devUrl}>{devUrl}</a>
        </div>
      ) : null}
    </div>
  );
}