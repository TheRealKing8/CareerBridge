import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { USER_ROLES, type UserRole } from "@/lib/enums";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * /register — sign up as a Student, Employer, or Employee.
 *
 * `?role=` (optional) preselects one of the three. The "Post a Job"
 * header CTA links here with `?role=employer`. Admin accounts are
 * seeded only — no public sign-up for them.
 */
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  const initialRole: UserRole =
    role?.toLowerCase() === "employer"
      ? "EMPLOYER"
      : role?.toLowerCase() === "employee"
        ? "EMPLOYEE"
        : "STUDENT";

  // Sign-up is restricted to non-admin roles.
  const roleOptions = USER_ROLES.filter(
    (r): r is Exclude<UserRole, "ADMIN"> => r !== "ADMIN",
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          CB
        </div>
        <span className="text-lg font-semibold">CareerBridge</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted">
        Students and employees browse and apply to jobs. Employers post
        jobs. (Admins are added by us — you can&apos;t self-signup as one.)
      </p>

      <div className="mt-6">
        <RegisterForm initialRole={initialRole} roleOptions={roleOptions} />
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}