import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

/**
 * /forgot-password — request a reset link.
 *
 * Always shows the same generic message after submit so we don't leak
 * which emails are on file. The form component handles the dev-mode
 * `devUrl` shortcut.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          CB
        </div>
        <span className="text-lg font-semibold">CareerBridge</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Forgot your password?
      </h1>
      <p className="mt-1 text-sm text-muted">
        Enter the email on your account and we&apos;ll send you a link to
        choose a new password.
      </p>

      <div className="mt-6">
        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}