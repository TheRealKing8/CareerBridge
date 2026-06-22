import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatSalary } from "@/lib/format";
import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Placeholder for the application form. We only render the job title
 * so we can confirm the click-through from /jobs/[id] works; the real
 * cover-letter + CV upload form lands in Phase 2c.
 */
export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;
  // Touch `requireRole` so the layout's role gate is mirrored here.
  await requireRole(["STUDENT", "EMPLOYEE"]);
  const job = jobId
    ? await prisma.job.findUnique({
        where: { id: jobId },
        include: { employer: true },
      })
    : null;

  return (
    <div className="space-y-6">
      {job ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-muted">
            Applying to
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {job.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {job.employer.companyName}
            {job.salaryMin != null
              ? ` · ${formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency ?? "KES")}`
              : ""}
          </p>
          <p className="mt-1 text-sm">
            <Link
              href={`/jobs/${job.id}`}
              className="text-primary hover:underline"
            >
              ← Back to job
            </Link>
          </p>
        </div>
      ) : null}
      <PlaceholderPanel
        title="Application form"
        description="Cover letter, CV upload, and optional portfolio links. Phase 2c adds the form + Cloudinary upload."
      />
    </div>
  );
}