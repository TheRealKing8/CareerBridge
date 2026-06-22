import { getCurrentUser } from "@/lib/session";
import { reportsService } from "@/lib/services/reports";

/**
 * GET /api/admin/reports/users.csv
 *
 * Streams the user-growth report as a CSV download. Three sections
 * separated by blank lines:
 *
 *   Signups by week
 *   week_start,count
 *   2026-04-06,3
 *   ...
 *
 *   Users by role
 *   role,count
 *   STUDENT,3
 *   ...
 *
 *   Users by status
 *   status,count
 *   ...
 *
 *   Email verification
 *   state,count
 *   verified,5
 *   unverified,2
 *
 *   Summary
 *   metric,value
 *   total,7
 *   signups_last_7_days,0
 *   first_signup,2026-04-01
 *
 * Admin-only. No CSRF check (GET).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Wraps a CSV cell in double quotes when it contains `,` or `"` or a newline. */
function csvCell(value: string | number | Date | null | undefined): string {
  if (value == null) return "";
  const s = value instanceof Date ? value.toISOString() : String(value);
  if (/[,"\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: Array<string | number | Date | null | undefined>): string {
  return cells.map(csvCell).join(",");
}

export async function GET() {
  const me = await getCurrentUser();
  if (!me || me.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const report = await reportsService.getUserGrowthReport();

  const lines: string[] = [];
  lines.push("# CareerBridge user report");
  lines.push(`# generated_at,${new Date().toISOString()}`);
  lines.push("");

  // 1. Signups by week.
  lines.push("# Signups by week");
  lines.push(csvRow(["week_start", "count"]));
  for (const w of report.signupsByWeek) {
    lines.push(csvRow([w.weekStart.toISOString().slice(0, 10), w.count]));
  }
  lines.push("");

  // 2. Users by role.
  lines.push("# Users by role");
  lines.push(csvRow(["role", "count"]));
  for (const role of ["STUDENT", "EMPLOYEE", "EMPLOYER", "ADMIN"] as const) {
    lines.push(csvRow([role, report.usersByRole[role]]));
  }
  lines.push("");

  // 3. Users by status.
  lines.push("# Users by status");
  lines.push(csvRow(["status", "count"]));
  for (const status of ["PENDING", "ACTIVE", "SUSPENDED"] as const) {
    lines.push(csvRow([status, report.usersByStatus[status]]));
  }
  lines.push("");

  // 4. Email verification.
  lines.push("# Email verification");
  lines.push(csvRow(["state", "count"]));
  lines.push(csvRow(["verified", report.verification.verified]));
  lines.push(csvRow(["unverified", report.verification.unverified]));
  lines.push("");

  // 5. Summary.
  lines.push("# Summary");
  lines.push(csvRow(["metric", "value"]));
  lines.push(csvRow(["total", report.total]));
  lines.push(csvRow(["signups_last_7_days", report.signupsLast7Days]));
  lines.push(
    csvRow([
      "first_signup",
      report.firstSignupAt ? report.firstSignupAt.toISOString().slice(0, 10) : "",
    ]),
  );

  const body = lines.join("\r\n") + "\r\n";
  const filename = `careerbridge-users-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
