/**
 * Display formatters used across the landing, public job pages, and dashboards.
 *
 * All functions are pure — no timezone or locale leakage beyond Intl defaults.
 */

const currencySymbols: Record<string, string> = {
  KES: "KSh",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined,
): string {
  const code = currency || "KES";
  const sym = currencySymbols[code] || `${code} `;

  if (min == null && max == null) return "Salary not disclosed";
  if (min != null && max != null) return `${sym}${min.toLocaleString()} – ${sym}${max.toLocaleString()}`;
  if (min != null) return `From ${sym}${min.toLocaleString()}`;
  return `Up to ${sym}${(max as number).toLocaleString()}`;
}

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const jobTypeLabels: Record<string, string> = {
  INTERNSHIP: "Internship",
  ATTACHMENT: "Attachment",
  GRADUATE_TRAINEE: "Graduate Trainee",
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
};

export function formatJobType(t: string | null | undefined): string {
  return (t && jobTypeLabels[t]) || "Job";
}

const jobStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
  EXPIRED: "Expired",
};

export function formatJobStatus(s: string | null | undefined): string {
  return (s && jobStatusLabels[s]) || "Unknown";
}