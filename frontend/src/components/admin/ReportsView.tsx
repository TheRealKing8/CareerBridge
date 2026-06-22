import { reportsService } from "@/lib/services/reports";

/**
 * Server-rendered reports dashboard. Pulls aggregate data from
 * `reportsService` and renders four stat cards, a signups-by-week
 * table, and a CSV download button. The download is a plain anchor —
 * no client JS required.
 */
export async function ReportsView() {
  const report = await reportsService.getUserGrowthReport();
  const verifiedPct =
    report.total > 0
      ? Math.round((report.verification.verified / report.total) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User reports</h1>
          <p className="mt-1 text-sm text-muted">
            Platform-wide signup growth and account breakdown. Generated
            live on every page load.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/reports/users.csv"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background"
          >
            <span aria-hidden>↓</span>
            Download CSV
          </a>
          <a
            href="/api/admin/reports/users.pdf"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-background"
          >
            <span aria-hidden>↓</span>
            Download PDF
          </a>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted">
          At a glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total users" value={report.total} />
          <StatCard
            label="Signups (last 7 days)"
            value={report.signupsLast7Days}
          />
          <StatCard
            label="Email verified"
            value={`${report.verification.verified} (${verifiedPct}%)`}
          />
          <StatCard
            label="Suspended"
            value={report.usersByStatus.SUSPENDED}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Signups by week</h2>
        {report.signupsByWeek.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            No signups yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2 font-medium">Week starting</th>
                  <th className="py-2 font-medium">Signups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...report.signupsByWeek].reverse().map((w) => (
                  <tr key={w.weekStart.toISOString()}>
                    <td className="py-2">
                      {w.weekStart.toISOString().slice(0, 10)}
                    </td>
                    <td className="py-2 font-medium">{w.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <BreakdownCard
          title="Users by role"
          rows={[
            ["Students", report.usersByRole.STUDENT],
            ["Employees", report.usersByRole.EMPLOYEE],
            ["Employers", report.usersByRole.EMPLOYER],
            ["Admins", report.usersByRole.ADMIN],
          ]}
        />
        <BreakdownCard
          title="Users by status"
          rows={[
            ["Active", report.usersByStatus.ACTIVE],
            ["Pending", report.usersByStatus.PENDING],
            ["Suspended", report.usersByStatus.SUSPENDED],
          ]}
        />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, number]>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <ul className="divide-y divide-border">
        {rows.map(([label, count]) => (
          <li key={label} className="flex items-center justify-between py-2">
            <span className="text-sm text-muted">{label}</span>
            <span className="text-sm font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
