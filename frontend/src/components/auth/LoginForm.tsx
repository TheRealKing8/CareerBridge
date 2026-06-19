"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema, flattenZodErrors } from "@/lib/validators";
import { PasswordInput } from "@/components/auth/PasswordInput";

/**
 * Credentials sign-in form.
 *
 * Flow:
 *  1. Client-side Zod validation → fast inline errors.
 *  2. `signIn("credentials", { redirect: false })` — NextAuth runs
 *     `authorize()` on the server, returns a session cookie on success.
 *  3. On success: read the user's role from `/api/auth/session` (one
 *     extra request, but reliable) and route to the right dashboard.
 *     Falls back to `next` if provided.
 *  4. On failure: show an inline "Invalid email or password" error.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (!result || result.error) {
        setSubmitError("Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      // Pull the role from the session so we land on the right home.
      const session = await fetch("/api/auth/session").then((r) => r.json());
      const role = session?.user?.role as string | undefined;
      const home =
        next ??
        (role === "ADMIN"
          ? "/admin"
          : role === "EMPLOYER"
            ? "/employer"
            : "/dashboard");
      router.push(home);
      router.refresh();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
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

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-foreground"
        >
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="password-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.password}
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
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}