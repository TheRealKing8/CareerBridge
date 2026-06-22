import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * /reset-password?token=… — consume a reset link.
 *
 * If no token is in the URL, show an inline error rather than mounting
 * the form. (The link only ever comes from the email we just sent.)
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          CB
        </div>
        <span className="text-lg font-semibold">CareerBridge</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Choose a new password
      </h1>
      <p className="mt-1 text-sm text-muted">
        Set a strong password you don&apos;t use anywhere else.
      </p>

      <div className="mt-6">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            This page requires a reset link from your email.{" "}
            <Link
              href="/forgot-password"
              className="font-medium underline"
            >
              Request a new one
            </Link>
            .
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
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