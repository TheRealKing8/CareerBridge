import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { JobRowActions } from "@/components/admin/JobRowActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * /admin/jobs — full job moderation queue.
 *
 * Filterable by status via `?status=`. Admins can:
 *   - Approve a DRAFT (→ OPEN, sets publishedAt)
 *   - Close an OPEN job (→ CLOSED)
 *   - Reopen a CLOSED job (→ OPEN)
 *   - Hard-delete a job (cascades via the Prisma schema)
 */
export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { status } = await searchParams;
  const allowedStatuses = ["DRAFT", "OPEN", "CLOSED", "EXPIRED"] as const;
  type AllowedStatus = (typeof allowedStatuses)[number];
  const filter: AllowedStatus | undefined = allowedStatuses.includes(
    status as AllowedStatus,
  )
    ? (status as AllowedStatus)
    : undefined;

  const jobs = await prisma.job.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: { employer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-1 text-sm text-muted">
          Approve drafts, close open listings, reopen closed ones, or
          delete a job entirely.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterPill label="All" href="/admin/jobs" active={!filter} />
        {allowedStatuses.map((s) => (
          <FilterPill
            key={s}
            label={s}
            href={`/admin/jobs?status=${s}`}
            active={filter === s}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {jobs.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            {filter
              ? `No ${filter.toLowerCase()} jobs.`
              : "No jobs yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Employer</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/jobs/${j.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {j.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {j.employer.companyName}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {j.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          j.status === "OPEN"
                            ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                            : j.status === "DRAFT"
                              ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                              : "rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-foreground"
                        }
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {j.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <JobRowActions
                        jobId={j.id}
                        status={j.status as "DRAFT" | "OPEN" | "CLOSED" | "EXPIRED"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:bg-card"
      }`}
    >
      {label}
    </Link>
  );
}