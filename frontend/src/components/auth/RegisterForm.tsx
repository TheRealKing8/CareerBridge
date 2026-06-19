"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  registerSchema,
  flattenZodErrors,
  type RegisterInput,
} from "@/lib/validators";
import { PasswordInput } from "@/components/auth/PasswordInput";
import type { UserRole } from "@/lib/enums";

/**
 * Sign-up form.
 *
 * Flow:
 *  1. Zod-validate the inputs → inline errors.
 *  2. POST to /api/register → server creates the user + matching profile.
 *  3. On success, immediately call `signIn("credentials", ...)` so the
 *     user lands in their dashboard with a valid session, no extra
 *     round-trip through /login.
 *  4. On register or sign-in failure: show an inline error.
 */
export function RegisterForm({
  initialRole,
  roleOptions,
}: {
  initialRole: UserRole;
  roleOptions: readonly UserRole[];
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError(null);

    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
      role,
    });
    if (!parsed.success) {
      setFieldErrors(flattenZodErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data satisfies RegisterInput),
      });
      const data: { ok?: boolean; error?: string; fieldErrors?: Record<string, string> } =
        await res.json();

      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setSubmitError(data.error ?? "Could not create account.");
        setIsSubmitting(false);
        return;
      }

      // Establish the session so the user lands in their dashboard
      // without bouncing through /login.
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });
      if (!result || result.error) {
        setSubmitError(
          "Account created, but sign-in failed. Please sign in manually.",
        );
        setIsSubmitting(false);
        return;
      }

      const home = role === "EMPLOYER" ? "/employer" : "/dashboard";
      router.push(home);
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
          htmlFor="fullName"
          className="block text-sm font-medium text-foreground"
        >
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {fieldErrors.fullName ? (
          <p id="fullName-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.fullName}
          </p>
        ) : null}
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "password-error" : "password-hint"
          }
        />
        {fieldErrors.password ? (
          <p id="password-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.password}
          </p>
        ) : (
          <p id="password-hint" className="mt-1 text-xs text-muted">
            At least 8 characters.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground"
        >
          Confirm password
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={Boolean(fieldErrors.confirmPassword)}
          aria-describedby={
            fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
        {fieldErrors.confirmPassword ? (
          <p
            id="confirmPassword-error"
            className="mt-1 text-xs text-red-600"
          >
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-foreground">
          I am a…
        </legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {roleOptions.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                role === r
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-card"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="sr-only"
              />
              {r === "STUDENT"
                ? "Student"
                : r === "EMPLOYER"
                  ? "Employer"
                  : "Employee"}
            </label>
          ))}
        </div>
      </fieldset>

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
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}