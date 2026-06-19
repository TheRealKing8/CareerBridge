import { CompanyCard } from "@/components/companies/CompanyCard";
import { prisma } from "@/lib/prisma";

export default async function CompaniesPage() {
  const employers = await prisma.employerProfile.findMany({
    where: { verified: true },
    orderBy: { createdAt: "desc" },
    take: 48,
    select: {
      id: true,
      companyName: true,
      industry: true,
      location: true,
      description: true,
      companyLogoUrl: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Top Companies</h1>
        <p className="mt-1 text-muted">
          {employers.length}{" "}
          {employers.length === 1 ? "verified employer" : "verified employers"} hiring on CareerBridge
        </p>
      </div>

      {employers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted">
          No verified employers yet. Check back soon.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employers.map((e) => (
            <CompanyCard
              key={e.id}
              company={{
                id: e.id,
                companyName: e.companyName,
                industry: e.industry,
                location: e.location,
                description: e.description,
                companyLogoUrl: e.companyLogoUrl,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}