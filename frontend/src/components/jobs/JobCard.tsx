import Link from "next/link";
import { formatJobType, formatRelative, formatSalary } from "@/lib/format";

/**
 * Server-renderable job card. Used on the landing page, /jobs, and the
 * student's saved jobs list. The shape accepts the minimum fields the
 * card needs so the same component works in all three contexts.
 */
export interface JobCardData {
  id: string;
  title: string;
  type: string;
  location: string | null;
  remote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  publishedAt: Date | string | null;
  employer?: {
    companyName: string;
    location?: string | null;
  } | null;
}

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
            {job.title}
          </h3>
          {job.employer ? (
            <p className="mt-0.5 truncate text-sm text-muted">{job.employer.companyName}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {formatJobType(job.type)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {job.location ? <span>{job.location}</span> : null}
        {job.remote ? <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Remote OK</span> : null}
        <span className="ml-auto text-xs">{job.publishedAt ? formatRelative(job.publishedAt) : "New"}</span>
      </div>

      <div className="mt-3 text-sm font-medium text-foreground">
        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
      </div>
    </Link>
  );
}