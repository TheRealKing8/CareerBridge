"use client";

import { useState } from "react";
import { forgotPasswordSchema, flattenZodErrors } from "@/lib/validators";

/**
 * Forgot-password request form.
 *
 * Posts to `/api/auth/forgot`. We always show the generic success
 * copy even when the email isn't on file — that's enforced server-side
 * too; here we just render whatever the server returns.
 *
 * If the server returned `devUrl` (only in dev when SMTP isn't
 * configured) we surface it as a clickable link so the developer can
 * test the reset flow end-to-end without an inbox.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);
    setSuccessMessage(null);
    setDevUrl(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data: {
        ok?: boolean;
        message?: string;
        error?: string;
        fieldErrors?: Record<string, string>;
        devUrl?: string;
      } = await res.json();

      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setSubmitError(data.error ?? "Could not send reset email.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        data.message ?? "If an account exists, we sent a reset link.",
      );
      setDevUrl(data.devUrl ?? null);
      setIsSubmitting(false);
    } catch {
      setSubmitError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {fieldErrors.email ? (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMessage}
        </div>
      ) : null}
      {devUrl ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <p className="font-medium">Dev mode — SMTP not configured.</p>
          <p className="mt-1 break-all">
            Reset link:{" "}
            <a className="underline" href={devUrl}>
              {devUrl}
            </a>
          </p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}