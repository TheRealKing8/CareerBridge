"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type JobStatus = "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED";

/**
 * Per-row actions for a job: approve (DRAFT→OPEN), close (OPEN→CLOSED),
 * reopen (CLOSED→OPEN), delete.
 */
export function JobRowActions({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<JobStatus | "delete" | null>(null);

  async function patch(action: "approve" | "close" | "reopen") {
    setError(null);
    setBusy(action === "approve" ? "DRAFT" : action === "close" ? "OPEN" : "CLOSED");
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
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

  async function remove() {
    if (!window.confirm("Delete this job? This cannot be undone.")) return;
    setError(null);
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
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
        {status === "DRAFT" ? (
          <button
            type="button"
            disabled={isPending || busy !== null}
            onClick={() => patch("approve")}
            className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "DRAFT" ? "Approving…" : "Approve"}
          </button>
        ) : null}
        {status === "OPEN" ? (
          <button
            type="button"
            disabled={isPending || busy !== null}
            onClick={() => patch("close")}
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "OPEN" ? "Closing…" : "Close"}
          </button>
        ) : null}
        {status === "CLOSED" ? (
          <button
            type="button"
            disabled={isPending || busy !== null}
            onClick={() => patch("reopen")}
            className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "CLOSED" ? "Reopening…" : "Reopen"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={isPending || busy !== null}
          onClick={remove}
          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "delete" ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}