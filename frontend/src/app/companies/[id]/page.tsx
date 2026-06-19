import { JobCard } from "@/components/jobs/JobCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const employer = await prisma.employerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true, email: true } },
      jobs: {
        where: { status: "OPEN" },
        orderBy: { publishedAt: "desc" },
        take: 24,
        include: { employer: { select: { companyName: true } } },
      },
    },
  });

  if (!employer || !employer.verified) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/companies"
        className="mb-6 inline-flex items-center text-sm text-muted hover:text-foreground"
      >
        ← Back to all companies
      </Link>

      <header className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
            {employer.companyName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {employer.companyName}
            </h1>
            {employer.industry && (
              <p className="mt-1 text-base text-muted">{employer.industry}</p>
            )}
            {employer.location && (
              <p className="mt-0.5 text-sm text-muted">{employer.location}</p>
            )}
            {employer.companyWebsite && (
              <a
                href={employer.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                Visit website →
              </a>
            )}
          </div>
        </div>

        {employer.description && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            <div className="prose prose-sm mt-3 max-w-none text-foreground/90">
              {employer.description.split("\n").map((para, i) =>
                para.trim() ? (
                  <p key={i} className="mt-2 leading-relaxed">
                    {para}
                  </p>
                ) : null,
              )}
            </div>
          </div>
        )}
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Open roles ({employer.jobs.length})
        </h2>

        {employer.jobs.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted">
            {employer.companyName} doesn&apos;t have any open roles right now.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {employer.jobs.map((j) => (
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
                  employer: { companyName: j.employer.companyName },
                }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}