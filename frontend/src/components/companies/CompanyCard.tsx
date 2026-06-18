import Link from "next/link";

export interface CompanyCardData {
  id: string;
  companyName: string;
  industry: string | null;
  location: string | null;
  companyLogoUrl: string | null;
  description: string | null;
}

export function CompanyCard({ company }: { company: CompanyCardData }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {company.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.companyLogoUrl}
            alt={`${company.companyName} logo`}
            className="h-12 w-12 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-primary/5 text-lg font-bold text-primary">
            {company.companyName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary">
            {company.companyName}
          </h3>
          <p className="truncate text-sm text-muted">
            {company.industry || "Industry not set"}
            {company.location ? ` · ${company.location}` : ""}
          </p>
        </div>
      </div>
      {company.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-muted">{company.description}</p>
      ) : null}
    </Link>
  );
}