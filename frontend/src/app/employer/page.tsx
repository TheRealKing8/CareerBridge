import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * /employer — employer overview.
 *
 * Real data:
 *  - Total active jobs + latest 5 with applicant counts.
 *  - Total applicants across all of the employer's jobs.
 *  - Recent applicants (latest 5).
 *  - Company profile completion %.
 */
export default async function EmployerPage() {
  const user = await requireRole(["EMPLOYER"]);
  const profile = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
  });

  const myJobs = await prisma.job.findMany({
    where: { employerId: profile?.id ?? "_none_" },
    include: { _count: { select: { applications: true } } },
    orderBy: { publishedAt: "desc" },
  });
  const totalApplicants = myJobs.reduce(
    (n, j) => n + j._count.applications,
    0,
  );

  // Profile completion: 6 fields at ~17% each (rounded to 100).
  const fields = [
    profile?.companyName,
    profile?.industry,
    profile?.companyWebsite,
    profile?.description,
    profile?.location,
    profile?.companyLogoUrl,
  ];
  const completed = fields.filter((f) => f != null && f !== "").length;
  const completion = Math.round((completed / fields.length) * 100);

  const recentApplicants = await prisma.application.findMany({
    where: { job: { employerId: profile?.id ?? "_none_" } },
    include: {
      job: true,
      student: { include: { user: true } },
      employeeProfile: { include: { user: true } },
    },
    orderBy: { appliedAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profile?.companyName ?? "Employer"} overview
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage your jobs and review applicants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active jobs"
          value={String(myJobs.filter((j) => j.status === "OPEN").length)}
          href="/employer/jobs"
        />
        <StatCard
          label="Total applicants"
          value={String(totalApplicants)}
          href="/employer/applicants"
        />
        <StatCard
          label="Profile completion"
          value={`${completion}%`}
          href="/employer/profile"
        />
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your jobs</h2>
          <Link
            href="/employer/jobs/new"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
          >
            Post a job
          </Link>
        </div>
        {myJobs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            You haven&apos;t posted any jobs yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {myJobs.slice(0, 5).map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/jobs/${j.id}`}
                    className="block truncate font-medium hover:text-primary"
                  >
                    {j.title}
                  </Link>
                  <div className="text-xs text-muted">
                    {j.type.replace(/_/g, " ")} · {j.location ?? "Remote"} ·{" "}
                    {j._count.applications} applicant
                    {j._count.applications === 1 ? "" : "s"}
                  </div>
                </div>
                <JobStatusBadge status={j.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent applicants</h2>
          <Link
            href="/employer/applicants"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        {recentApplicants.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No applicants yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentApplicants.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {/* Applications carry either a student applicant or
                        an employee applicant. Exactly one will be set. */}
                    {a.student?.user.fullName ??
                      a.employeeProfile?.user.fullName ??
                      "Unknown applicant"}
                    {a.employeeProfile ? (
                      <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                        Experienced
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted">
                    Applied for{" "}
                    <Link
                      href={`/jobs/${a.job.id}`}
                      className="hover:text-primary"
                    >
                      {a.job.title}
                    </Link>
                    {" "}· {a.appliedAt.toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
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

function JobStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    OPEN: "bg-green-100 text-green-800",
    CLOSED: "bg-red-100 text-red-800",
    EXPIRED: "bg-yellow-100 text-yellow-800",
  };
  const cls = colors[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}