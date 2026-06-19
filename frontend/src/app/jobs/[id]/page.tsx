import { prisma } from "@/lib/prisma";
import { formatDate, formatJobType, formatSalary } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      employer: {
        include: {
          user: { select: { fullName: true, email: true } },
        },
      },
    },
  });

  if (!job || job.status !== "OPEN") {
    notFound();
  }

  const applyHref =
    user == null
      ? `/login?next=${encodeURIComponent(`/jobs/${job.id}`)}`
      : user.role === "STUDENT" || user.role === "EMPLOYEE"
        ? `/dashboard/applications/new?jobId=${job.id}`
        : null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center text-sm text-muted hover:text-foreground"
      >
        ← Back to all jobs
      </Link>

      <header className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {formatJobType(job.type)}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{job.title}</h1>
            <p className="mt-1 text-base text-muted">{job.employer.companyName}</p>
          </div>
          {applyHref && (
            <Link
              href={applyHref}
              className="shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            >
              {user ? "Apply Now" : "Sign in to apply"}
            </Link>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-6 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted">Location</dt>
            <dd className="mt-1 font-medium text-foreground">
              {job.location || (job.remote ? "Remote" : "Not specified")}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Remote</dt>
            <dd className="mt-1 font-medium text-foreground">{job.remote ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-muted">Salary</dt>
            <dd className="mt-1 font-medium text-foreground">
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Posted</dt>
            <dd className="mt-1 font-medium text-foreground">
              {job.publishedAt ? formatDate(job.publishedAt) : "Recently"}
            </dd>
          </div>
          {job.deadline && (
            <div>
              <dt className="text-muted">Apply by</dt>
              <dd className="mt-1 font-medium text-foreground">{formatDate(job.deadline)}</dd>
            </div>
          )}
        </dl>
      </header>

      <section className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Description</h2>
        <div className="prose prose-sm mt-4 max-w-none text-foreground">
          {job.description.split("\n").map((para, i) =>
            para.trim() ? (
              <p key={i} className="mt-3 leading-relaxed text-foreground/90">
                {para}
              </p>
            ) : null,
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">About the employer</h2>
        <div className="mt-3">
          <Link
            href={`/companies/${job.employer.id}`}
            className="text-base font-medium text-primary hover:underline"
          >
            {job.employer.companyName}
          </Link>
          {job.employer.industry && (
            <p className="mt-1 text-sm text-muted">{job.employer.industry}</p>
          )}
          {job.employer.location && (
            <p className="mt-0.5 text-sm text-muted">{job.employer.location}</p>
          )}
        </div>
      </section>
    </main>
  );
}