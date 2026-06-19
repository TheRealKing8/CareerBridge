import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

/**
 * /login — credential sign-in.
 *
 * Reads `?next=` from the URL so the proxy's `?next=<original-path>`
 * redirect lands the user where they were trying to go.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reset?: string }>;
}) {
  const { next, reset } = await searchParams;
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          CB
        </div>
        <span className="text-lg font-semibold">CareerBridge</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to apply to jobs, post listings, or manage your account.
      </p>

      {reset ? (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Your password has been reset. Sign in with your new password.
        </div>
      ) : null}

      <div className="mt-6">
        <LoginForm next={next} />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted">
        <Link
          href="/forgot-password"
          className="font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </div>
  );
}