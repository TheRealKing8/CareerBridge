"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  resetPasswordSchema,
  flattenZodErrors,
} from "@/lib/validators";
import { PasswordInput } from "@/components/auth/PasswordInput";

/**
 * Reset-password form.
 *
 * Reads `?token=` from the URL (parent page passes it down as a prop
 * so this component can stay a pure client component without
 * `useSearchParams`).
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);

    const parsed = resetPasswordSchema.safeParse({
      token,
      newPassword,
      confirmNewPassword,
    });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      } = await res.json();
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setSubmitError(data.error ?? "Could not reset password.");
        setIsSubmitting(false);
        return;
      }
      router.push("/login?reset=1");
      router.refresh();
    } catch {
      setSubmitError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-foreground"
        >
          New password
        </label>
        <PasswordInput
          id="newPassword"
          name="newPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.newPassword)}
          aria-describedby={
            fieldErrors.newPassword ? "newPassword-error" : "newPassword-hint"
          }
        />
        {fieldErrors.newPassword ? (
          <p id="newPassword-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.newPassword}
          </p>
        ) : (
          <p id="newPassword-hint" className="mt-1 text-xs text-muted">
            At least 8 characters.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmNewPassword"
          className="block text-sm font-medium text-foreground"
        >
          Confirm new password
        </label>
        <PasswordInput
          id="confirmNewPassword"
          name="confirmNewPassword"
          autoComplete="new-password"
          required
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.confirmNewPassword)}
          aria-describedby={
            fieldErrors.confirmNewPassword
              ? "confirmNewPassword-error"
              : undefined
          }
        />
        {fieldErrors.confirmNewPassword ? (
          <p
            id="confirmNewPassword-error"
            className="mt-1 text-xs text-red-600"
          >
            {fieldErrors.confirmNewPassword}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}