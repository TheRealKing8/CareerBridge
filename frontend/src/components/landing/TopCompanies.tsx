import { prisma } from "@/lib/prisma";
import { CompanyCard } from "@/components/companies/CompanyCard";
import Link from "next/link";

export async function TopCompanies() {
  const companies = await prisma.employerProfile.findMany({
    where: { verified: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="bg-card/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Top Companies</h2>
            <p className="mt-1 text-muted">Verified employers hiring on CareerBridge.</p>
          </div>
          <Link
            href="/companies"
            className="hidden text-sm font-medium text-primary hover:underline sm:inline"
          >
            View all companies →
          </Link>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted">
            No companies have joined yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {companies.map((c) => (
              <CompanyCard
                key={c.id}
                company={{
                  id: c.id,
                  companyName: c.companyName,
                  industry: c.industry,
                  location: c.location,
                  companyLogoUrl: c.companyLogoUrl,
                  description: c.description,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}