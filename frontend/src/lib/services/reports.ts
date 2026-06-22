import { prisma } from "@/lib/prisma";
import { USER_ROLES, type UserRole } from "@/lib/enums";

/**
 * Reports service — read-only aggregates over the platform's user/job
 * activity. Used by `/admin/reports` and the CSV export route.
 *
 * Everything here is a server-only read. No writes, no side effects.
 */

/** A single ISO-week bucket of signups. */
export type SignupsByWeek = {
  /** Monday (UTC) of the week. */
  weekStart: Date;
  count: number;
};

/** Aggregate report covering user growth and breakdown. */
export type UserGrowthReport = {
  total: number;
  /** Signups grouped by ISO week, oldest → newest. Always contains every
   *  week from the first signup through the current week (zero-fill). */
  signupsByWeek: SignupsByWeek[];
  /** Count per role. Roles with zero users are still present (0). */
  usersByRole: Record<UserRole, number>;
  /** Count per status. */
  usersByStatus: Record<"PENDING" | "ACTIVE" | "SUSPENDED", number>;
  /** Email-verification breakdown. */
  verification: { verified: number; unverified: number };
  /** Signups in the trailing 7 days. */
  signupsLast7Days: number;
  /** First-ever signup timestamp — null when there are no users. */
  firstSignupAt: Date | null;
};

const WEEKS_TO_KEEP = 12; // Cover the last ~3 months even if growth is sparse.

/** Returns the Monday (UTC) of the ISO week containing `date`. */
function isoWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // getUTCDay: 0=Sun, 1=Mon, ... 6=Sat. Shift so Monday=0.
  const day = d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1;
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

export const reportsService = {
  /**
   * Aggregates user growth and breakdown. Designed to be cheap enough
   * to call from both the dashboard page and the CSV export endpoint.
   */
  async getUserGrowthReport(now: Date = new Date()): Promise<UserGrowthReport> {
    const [users, first] = await Promise.all([
      prisma.user.findMany({
        select: { role: true, status: true, createdAt: true, emailVerified: true },
      }),
      prisma.user.findFirst({
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
    ]);

    // Counters.
    const usersByRole: Record<UserRole, number> = {
      STUDENT: 0,
      EMPLOYER: 0,
      EMPLOYEE: 0,
      ADMIN: 0,
    };
    const usersByStatus: Record<"PENDING" | "ACTIVE" | "SUSPENDED", number> = {
      PENDING: 0,
      ACTIVE: 0,
      SUSPENDED: 0,
    };
    let verified = 0;
    let unverified = 0;
    const weekCounts = new Map<number, number>();
    const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    let signupsLast7Days = 0;

    for (const u of users) {
      if ((USER_ROLES as readonly string[]).includes(u.role)) {
        usersByRole[u.role as UserRole] += 1;
      }
      if (
        u.status === "PENDING" ||
        u.status === "ACTIVE" ||
        u.status === "SUSPENDED"
      ) {
        usersByStatus[u.status] += 1;
      }
      if (u.emailVerified) verified += 1;
      else unverified += 1;

      const wk = isoWeekStart(u.createdAt).getTime();
      weekCounts.set(wk, (weekCounts.get(wk) ?? 0) + 1);

      if (u.createdAt.getTime() >= cutoff) signupsLast7Days += 1;
    }

    // Build a continuous week range so the chart has no gaps.
    const earliest = first
      ? isoWeekStart(first.createdAt)
      : isoWeekStart(now);
    const latest = isoWeekStart(now);
    const signupsByWeek: SignupsByWeek[] = [];
    for (let t = earliest.getTime(); t <= latest.getTime(); t += 7 * 24 * 60 * 60 * 1000) {
      signupsByWeek.push({
        weekStart: new Date(t),
        count: weekCounts.get(t) ?? 0,
      });
    }
    // Trim to the last N weeks (keep the most recent).
    const trimmed =
      signupsByWeek.length > WEEKS_TO_KEEP
        ? signupsByWeek.slice(-WEEKS_TO_KEEP)
        : signupsByWeek;

    return {
      total: users.length,
      signupsByWeek: trimmed,
      usersByRole,
      usersByStatus,
      verification: { verified, unverified },
      signupsLast7Days,
      firstSignupAt: first?.createdAt ?? null,
    };
  },
};
