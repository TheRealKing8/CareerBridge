import Link from "next/link";
import { JOB_TYPES } from "@/lib/enums";
import { formatJobType } from "@/lib/format";

const CATEGORIES: Array<{ label: string; href: string }> = [
  { label: "Internships", href: "/jobs?type=INTERNSHIP" },
  { label: "Attachments", href: "/jobs?type=ATTACHMENT" },
  { label: "Graduate Programs", href: "/jobs?type=GRADUATE_TRAINEE" },
  { label: "Full-time", href: "/jobs?type=FULL_TIME" },
  { label: "Part-time", href: "/jobs?type=PART_TIME" },
  { label: "Contract", href: "/jobs?type=CONTRACT" },
  { label: "Remote", href: "/jobs?q=remote" },
];

const POPULAR: Array<{ label: string; href: string }> = [
  { label: "Software Engineering", href: "/jobs?q=software+engineering" },
  { label: "Data Analytics", href: "/jobs?q=data+analytics" },
  { label: "Marketing", href: "/jobs?q=marketing" },
  { label: "Product Design", href: "/jobs?q=product+design" },
  { label: "Finance", href: "/jobs?q=finance" },
];

/**
 * Fiverr-style hero. Centered, search-first.
 * Server component — the search form posts a plain GET to /jobs.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary py-16 text-white sm:py-24">
      {/* Decorative blur orbs */}
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        {/* Stat chip */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
          <span aria-hidden>🚀</span> 1,200+ opportunities this week
        </span>

        {/* Headline */}
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Find the right opportunity,{" "}
          <span className="bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
            faster
          </span>
          .
        </h1>

        {/* Subhead */}
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
          Internships, attachments, graduate programs, and full-time roles — all
          in one place, all from verified employers.
        </p>

        {/* Search bar */}
        <form
          action="/jobs"
          method="get"
          className="mt-8 flex flex-col gap-2 rounded-full bg-white p-2 shadow-2xl sm:flex-row sm:items-center sm:gap-0"
        >
          <select
            name="type"
            aria-label="Job type"
            defaultValue=""
            className="rounded-full bg-transparent px-4 py-2 text-sm text-foreground focus:outline-none sm:rounded-none sm:border-r sm:border-border sm:pr-3"
          >
            <option value="">All types</option>
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatJobType(t)}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="q"
            placeholder="Search by title, company, or keyword…"
            className="flex-1 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        {/* Category pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur transition-colors hover:bg-white/20"
            >
              {c.label}
            </Link>
          ))}
        </div>

        {/* Popular tags */}
        <p className="mt-6 text-xs text-white/70">
          <span className="font-semibold text-white/90">Popular:</span>{" "}
          {POPULAR.map((p, i) => (
            <span key={p.label}>
              <Link href={p.href} className="underline-offset-2 hover:underline">
                {p.label}
              </Link>
              {i < POPULAR.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}