import { JobCard } from "@/components/jobs/JobCard";
import { prisma } from "@/lib/prisma";
import { JOB_TYPES } from "@/lib/enums";
import Link from "next/link";
import { formatJobType } from "@/lib/format";

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const { q, type, page: pageRaw } = await searchParams;
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);

  const where: {
    status: string;
    type?: string;
    OR?: Array<Record<string, { contains: string }>>;
  } = { status: "OPEN" };

  if (type && (JOB_TYPES as readonly string[]).includes(type)) {
    where.type = type;
  }
  if (q && q.trim()) {
    where.OR = [
      { title: { contains: q.trim() } },
      { description: { contains: q.trim() } },
      { location: { contains: q.trim() } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { employer: { select: { companyName: true } } },
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Browse Jobs</h1>
        <p className="mt-1 text-muted">
          {total} {total === 1 ? "opportunity" : "opportunities"} available
        </p>
      </div>

      <form className="mb-6 flex flex-col gap-3 sm:flex-row" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by title, location, keyword…"
          className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {formatJobType(t)}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {/* Type chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/jobs"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !type ? "bg-primary text-white" : "bg-card text-muted hover:text-foreground"
          }`}
        >
          All
        </Link>
        {JOB_TYPES.map((t) => (
          <Link
            key={t}
            href={`/jobs?type=${t}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              type === t ? "bg-primary text-white" : "bg-card text-muted hover:text-foreground"
            }`}
          >
            {formatJobType(t)}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted">
          No jobs match your filters. Try widening your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildHref({ q, type, page: page - 1 })}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary"
            >
              ← Previous
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildHref({ q, type, page: page + 1 })}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </main>
  );
}

function buildHref(p: { q?: string; type?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.type) sp.set("type", p.type);
  if (p.page) sp.set("page", String(p.page));
  const qs = sp.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}