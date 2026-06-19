"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Per-row actions for an employer: verify / unverify, suspend / reactivate.
 *
 * Server-side guards in `/api/admin/employers/[id]` re-check `requireRole(["ADMIN"])`.
 * On success we refresh the server data so the row updates without a hard reload.
 */
export function EmployerRowActions({
  userId,
  verified,
  status,
}: {
  userId: string;
  verified: boolean;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"verify" | "status" | null>(null);

  async function call(body: Record<string, unknown>, which: "verify" | "status") {
    setError(null);
    setBusy(which);
    try {
      const res = await fetch(`/api/admin/employers/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Action failed.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={isPending || busy !== null}
          onClick={() =>
            call({ verified: !verified }, "verify")
          }
          className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "verify"
            ? "Saving…"
            : verified
              ? "Unverify"
              : "Verify"}
        </button>
        {status === "SUSPENDED" ? (
          <button
            type="button"
            disabled={isPending || busy !== null}
            onClick={() => call({ status: "ACTIVE" }, "status")}
            className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "status" ? "Saving…" : "Reactivate"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending || busy !== null}
            onClick={() => call({ status: "SUSPENDED" }, "status")}
            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "status" ? "Saving…" : "Suspend"}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}