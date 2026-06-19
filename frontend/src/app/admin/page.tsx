import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * /admin — platform overview.
 *
 * Real data: total counts by role/status, total jobs/applications,
 * latest 10 signups, latest 5 jobs awaiting moderation.
 */
export default async function AdminPage() {
  await requireRole(["ADMIN"]);

  const [
    studentsActive,
    studentsPending,
    studentsSuspended,
    employersActive,
    employersPending,
    employersSuspended,
    admins,
    jobsOpen,
    jobsDraft,
    applicationCount,
    latestUsers,
    latestJobs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "STUDENT", status: "PENDING" } }),
    prisma.user.count({ where: { role: "STUDENT", status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "EMPLOYER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "EMPLOYER", status: "PENDING" } }),
    prisma.user.count({ where: { role: "EMPLOYER", status: "SUSPENDED" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.job.count({ where: { status: "DRAFT" } }),
    prisma.application.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.job.findMany({
      where: { status: "DRAFT" },
      include: { employer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform overview</h1>
        <p className="mt-1 text-sm text-muted">
          A snapshot of users, jobs, and applications across CareerBridge.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
          Users by role and status
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <RoleCard
            role="Students"
            active={studentsActive}
            pending={studentsPending}
            suspended={studentsSuspended}
            href="/admin/users?role=STUDENT"
          />
          <RoleCard
            role="Employers"
            active={employersActive}
            pending={employersPending}
            suspended={employersSuspended}
            href="/admin/employers"
          />
          <RoleCard
            role="Admins"
            active={admins}
            pending={0}
            suspended={0}
            href="/admin/users?role=ADMIN"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
          Activity
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Open jobs" value={String(jobsOpen)} href="/admin/jobs?status=OPEN" />
          <StatCard label="Draft jobs" value={String(jobsDraft)} href="/admin/jobs?status=DRAFT" />
          <StatCard label="Applications" value={String(applicationCount)} href="/admin/applications" />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest signups</h2>
          <Link
            href="/admin/users"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {latestUsers.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No users yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">Email</th>
                  <th className="py-2 font-medium">Role</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {latestUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2 font-medium">{u.fullName}</td>
                    <td className="py-2 text-muted">{u.email}</td>
                    <td className="py-2">{u.role}</td>
                    <td className="py-2">{u.status}</td>
                    <td className="py-2 text-muted">
                      {u.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {latestJobs.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Jobs awaiting moderation</h2>
            <Link
              href="/admin/jobs?status=DRAFT"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {latestJobs.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{j.title}</div>
                  <div className="text-xs text-muted">
                    {j.employer.companyName} · created{" "}
                    {j.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <Link
                  href={`/jobs/${j.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function RoleCard({
  role,
  active,
  pending,
  suspended,
  href,
}: {
  role: string;
  active: number;
  pending: number;
  suspended: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
    >
      <div className="text-xs uppercase tracking-wide text-muted">{role}</div>
      <div className="mt-1 text-2xl font-semibold">{active}</div>
      <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
        <span className="text-muted">Pending: {pending}</span>
        <span className="text-muted">Suspended: {suspended}</span>
      </div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40"
    >
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Link>
  );
}