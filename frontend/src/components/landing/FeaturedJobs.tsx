import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/jobs/JobCard";
import Link from "next/link";

export async function FeaturedJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { publishedAt: "desc" },
    take: 4,
    include: { employer: { select: { companyName: true } } },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Featured Jobs</h2>
          <p className="mt-1 text-muted">The latest opportunities from top employers.</p>
        </div>
        <Link
          href="/jobs"
          className="hidden text-sm font-medium text-primary hover:underline sm:inline"
        >
          View all jobs →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted">
          No featured jobs yet — check back soon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((j) => (
            <JobCard
              key={j.id}
              job={{
                id: j.id,
                title: j.title,
                type: j.type,
                location: j.location,
                remote: j.remote,
                salaryMin: j.salaryMin,
                salaryMax: j.salaryMax,
                salaryCurrency: j.salaryCurrency,
                publishedAt: j.publishedAt,
                employer: j.employer ? { companyName: j.employer.companyName } : null,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}