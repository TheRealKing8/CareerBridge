import { prisma } from "@/lib/prisma";
import { formatJobType } from "@/lib/format";
import { JOB_TYPES, type JobType } from "@/lib/enums";
import type { CurrentUser } from "@/lib/session";

/**
 * AI context — every chat turn injects a small, *live* snapshot of the
 * platform into the system prompt so the model answers with current
 * numbers, real job titles, and real employers instead of inventing
 * them.
 *
 * Scope of the snapshot (kept compact for a free-tier model):
 *   - Platform totals: users, verified employers, open jobs.
 *   - Open jobs by type (count).
 *   - The most recent 5 OPEN jobs (title, type, employer, location).
 *   - If the caller is signed in: their own role, status, and profile
 *     summary so advice can be tailored ("you're a STUDENT — focus on
 *     internship + graduate trainee listings…").
 *
 * Numbers come from the same Prisma client the rest of the app reads.
 * Each chat request pays one extra round-trip per metric; cheap
 * because the queries are counts and a 5-row findMany.
 *
 * Privacy: only the signed-in user's own profile data is exposed.
 * No emails / passwords / names of *other* users leak into the
 * prompt.
 */
export type ChatContext = {
  generatedAt: string;
  totals: {
    users: number;
    verifiedEmployers: number;
    openJobs: number;
  };
  openJobsByType: Record<JobType, number>;
  recentOpenJobs: Array<{
    title: string;
    type: string;
    location: string | null;
    remote: boolean;
    company: string;
  }>;
  viewer: {
    role: string;
    status: string;
    emailVerified: boolean;
    profile: string | null;
  } | null;
};

const RECENT_OPEN_JOBS_LIMIT = 5;

export async function buildChatContext(
  viewer: CurrentUser | null,
): Promise<ChatContext> {
  // Run every independent count/find in parallel.
  const [
    users,
    verifiedEmployers,
    openJobs,
    openByType,
    recent,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.employerProfile.count({ where: { verified: true } }),
    prisma.job.count({ where: { status: "OPEN" } }),
    groupOpenByType(),
    prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { publishedAt: "desc" },
      take: RECENT_OPEN_JOBS_LIMIT,
      select: {
        title: true,
        type: true,
        location: true,
        remote: true,
        employer: { select: { companyName: true } },
      },
    }),
  ]);

  let viewerBlock: ChatContext["viewer"] = null;
  if (viewer) {
    viewerBlock = {
      role: viewer.role,
      status: viewer.status,
      emailVerified: !!viewer.emailVerified,
      profile: await viewerProfileSummary(viewer),
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    totals: { users, verifiedEmployers, openJobs },
    openJobsByType: openByType,
    recentOpenJobs: recent.map((j) => ({
      title: j.title,
      type: formatJobType(j.type),
      location: j.location,
      remote: j.remote,
      company: j.employer.companyName,
    })),
    viewer: viewerBlock,
  };
}

/**
 * One groupBy call gives us every type-count in a single round trip.
 * Zero-fills any type with no open jobs so the prompt has a complete
 * picture.
 */
async function groupOpenByType(): Promise<Record<JobType, number>> {
  const grouped = await prisma.job.groupBy({
    by: ["type"],
    where: { status: "OPEN" },
    _count: { _all: true },
  });

  const out = {} as Record<JobType, number>;
  for (const t of JOB_TYPES) out[t] = 0;
  for (const row of grouped) {
    if ((JOB_TYPES as readonly string[]).includes(row.type)) {
      out[row.type as JobType] = row._count._all;
    }
  }
  return out;
}

/**
 * Build a one-line profile summary for the signed-in user. We pull
 * only the field that's most useful to career advice (current
 * company, university, course) and keep the line under ~120 chars
 * so it never dominates the prompt.
 */
async function viewerProfileSummary(user: CurrentUser): Promise<string | null> {
  if (user.role === "STUDENT") {
    const p = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      select: { university: true, course: true, graduationYear: true },
    });
    if (!p) return null;
    const parts = [p.university, p.course, p.graduationYear && `class of ${p.graduationYear}`]
      .filter(Boolean)
      .map(String);
    return parts.length ? parts.join(" · ") : null;
  }

  if (user.role === "EMPLOYER") {
    const p = await prisma.employerProfile.findUnique({
      where: { userId: user.id },
      select: { companyName: true, industry: true, verified: true },
    });
    if (!p) return null;
    const parts = [p.companyName, p.industry, p.verified ? "verified" : null]
      .filter(Boolean)
      .map(String);
    return parts.length ? parts.join(" · ") : null;
  }

  if (user.role === "EMPLOYEE") {
    const p = await prisma.employeeProfile.findUnique({
      where: { userId: user.id },
      select: { currentJobTitle: true, currentCompany: true, yearsOfExperience: true },
    });
    if (!p) return null;
    const parts = [
      p.currentJobTitle,
      p.currentCompany,
      typeof p.yearsOfExperience === "number"
        ? `${p.yearsOfExperience} yrs experience`
        : null,
    ]
      .filter(Boolean)
      .map(String);
    return parts.length ? parts.join(" · ") : null;
  }

  return null;
}

/**
 * Render the live snapshot as a system-prompt block. Kept as a pure
 * function so it's easy to test and to keep the route handler
 * focused on transport concerns.
 */
export function renderChatContext(ctx: ChatContext): string {
  const typeRows = (Object.keys(ctx.openJobsByType) as JobType[])
    .map((t) => `  - ${formatJobType(t)}: ${ctx.openJobsByType[t]}`)
    .join("\n");

  const recentRows = ctx.recentOpenJobs.length
    ? ctx.recentOpenJobs
        .map(
          (j) =>
            `  - ${j.title} (${j.type}) at ${j.company}` +
            (j.location ? ` — ${j.location}` : "") +
            (j.remote ? " [remote]" : ""),
        )
        .join("\n")
    : "  - (no open jobs right now)";

  const viewerRow = ctx.viewer
    ? `The user is signed in as ${ctx.viewer.role} (status: ${ctx.viewer.status}, ` +
      `email verified: ${ctx.viewer.emailVerified ? "yes" : "no"}).` +
      (ctx.viewer.profile ? ` Profile: ${ctx.viewer.profile}.` : "")
    : "The user is not signed in.";

  return [
    "Live CareerBridge snapshot (refreshed every request):",
    "",
    `Platform totals:`,
    `  - Users: ${ctx.totals.users}`,
    `  - Verified employers: ${ctx.totals.verifiedEmployers}`,
    `  - Open jobs: ${ctx.totals.openJobs}`,
    "",
    `Open jobs by type:`,
    typeRows,
    "",
    `Recent open jobs (use these exact titles when recommending):`,
    recentRows,
    "",
    viewerRow,
    "",
    `Rules:`,
    `  - Use ONLY the listings above when recommending a specific job. Never invent titles, companies, or counts.`,
    `  - If a user asks for a job type or location that has no current openings, say so and suggest related types from the table above.`,
    `  - For application help or CV advice, point to /resources.`,
  ].join("\n");
}