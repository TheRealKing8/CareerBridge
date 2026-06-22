import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatSalary } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * /dashboard — overview for both STUDENT and EMPLOYEE users.
 *
 * Branches on `user.role` to read the right profile (StudentProfile vs
 * EmployeeProfile) and to compute profile-completion from the right
 * field set. Application and saved-job queries use a union filter so
 * the same page works for either role.
 */
export default async function DashboardPage() {
  const user = await requireRole(["STUDENT", "EMPLOYEE"]);

  const isStudent = user.role === "STUDENT";

  // Profile fields we use to compute completion. Different shape per role.
  const studentProfile = isStudent
    ? await prisma.studentProfile.findUnique({ where: { userId: user.id } })
    : null;
  const employeeProfile = !isStudent
    ? await prisma.employeeProfile.findUnique({ where: { userId: user.id } })
    : null;

  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { student: { userId: user.id } },
        { employeeProfile: { userId: user.id } },
      ],
    },
    include: { job: { include: { employer: true } } },
    orderBy: { appliedAt: "desc" },
    take: 5,
  });
  const totalApplications = await prisma.application.count({
    where: {
      OR: [
        { student: { userId: user.id } },
        { employeeProfile: { userId: user.id } },
      ],
    },
  });
  // Saved jobs are currently student-only; for EMPLOYEE we show 0/empty.
  const savedJobs = isStudent
    ? await prisma.savedJob.findMany({
        where: { student: { userId: user.id } },
        include: { job: { include: { employer: true } } },
        orderBy: { savedAt: "desc" },
        take: 5,
      })
    : [];
  const totalSaved = isStudent
    ? await prisma.savedJob.count({ where: { student: { userId: user.id } } })
    : 0;

  // Profile completion: 5 fields at 20% each, role-specific.
  const studentFields = [
    studentProfile?.university,
    studentProfile?.course,
    studentProfile?.graduationYear,
    studentProfile?.phone,
    studentProfile?.bio,
  ];
  const employeeFields = [
    employeeProfile?.currentJobTitle,
    employeeProfile?.currentCompany,
    employeeProfile?.yearsOfExperience,
    employeeProfile?.skills,
    employeeProfile?.bio,
  ];
  const fields = isStudent ? studentFields : employeeFields;
  const completed = fields.filter((f) => f != null && f !== "").length;
  const completion = Math.round((completed / fields.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.fullName.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s what&apos;s happening with your job search.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Applications"
          value={String(totalApplications)}
          href="/dashboard/applications"
        />
        <StatCard
          label={isStudent ? "Saved jobs" : "Saved jobs (coming soon)"}
          value={String(totalSaved)}
          href="/dashboard/saved"
        />
        <StatCard
          label="Profile completion"
          value={`${completion}%`}
          href="/dashboard/profile"
        />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent applications</h2>
          <Link
            href="/dashboard/applications"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            message="You haven't applied to any jobs yet."
            cta={
              <Link
                href="/jobs"
                className="text-sm font-medium text-primary hover:underline"
              >
                Browse jobs →
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {applications.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/jobs/${a.job.id}`}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {a.job.title}
                  </Link>
                  <div className="text-xs text-muted">
                    {a.job.employer.companyName} · applied{" "}
                    {a.appliedAt.toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {isStudent ? (
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Saved jobs</h2>
            <Link
              href="/dashboard/saved"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {savedJobs.length === 0 ? (
            <EmptyState message="No saved jobs yet. Save interesting listings to revisit them later." />
          ) : (
            <ul className="divide-y divide-border">
              {savedJobs.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${s.job.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {s.job.title}
                    </Link>
                    <div className="text-xs text-muted">
                      {s.job.employer.companyName}
                      {s.job.salaryMin != null
                        ? ` · ${formatSalary(s.job.salaryMin, null, s.job.salaryCurrency ?? "KES")}`
                        : ""}
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${s.job.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
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
      <div className="text-xs uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SUBMITTED: "bg-blue-100 text-blue-800",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
    SHORTLISTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    WITHDRAWN: "bg-gray-100 text-gray-800",
  };
  const cls = colors[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function EmptyState({
  message,
  cta,
}: {
  message: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="py-6 text-center text-sm text-muted">
      <p>{message}</p>
      {cta ? <div className="mt-3">{cta}</div> : null}
    </div>
  );
}