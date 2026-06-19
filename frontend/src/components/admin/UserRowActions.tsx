"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { USER_ROLES, type UserRole } from "@/lib/enums";

/**
 * Per-row admin actions: change role, suspend/reactivate, delete.
 *
 * The change-role select is uncontrolled-style: it shows the current
 * value and PATCHes on change. Deletion requires a confirmation step
 * so a misclick doesn't take a user (and all their applications)
 * out of the system.
 */
export function UserRowActions({
  userId,
  currentRole,
  currentStatus,
  isSelf,
}: {
  userId: string;
  currentRole: UserRole;
  currentStatus: "ACTIVE" | "SUSPENDED" | "PENDING";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"role" | "status" | "delete" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function patch(
    body: Record<string, unknown>,
    which: "role" | "status" | "delete",
  ) {
    setError(null);
    setBusy(which);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
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

  async function del() {
    setError(null);
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Delete failed.");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          aria-label="Change role"
          disabled={isPending || busy !== null || isSelf}
          value={currentRole}
          onChange={(e) => patch({ role: e.target.value }, "role")}
          className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {currentStatus === "SUSPENDED" ? (
          <button
            type="button"
            disabled={isPending || busy !== null || isSelf}
            onClick={() => patch({ status: "ACTIVE" }, "status")}
            className="rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "status" ? "Saving…" : "Reactivate"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending || busy !== null || isSelf}
            onClick={() => patch({ status: "SUSPENDED" }, "status")}
            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "status" ? "Saving…" : "Suspend"}
          </button>
        )}

        {confirmingDelete ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={del}
              disabled={busy !== null}
              className="rounded-lg border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy === "delete" ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={busy !== null}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending || busy !== null || isSelf}
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        )}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
