import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { UserGrowthReport } from "@/lib/services/reports";

/**
 * PDF rendering of the user-growth report. Server-side rendered via
 * `@react-pdf/renderer` — no Chromium, no native deps. Built-in
 * Helvetica font is used; no font files to ship.
 *
 * Layout (A4, 60pt margins):
 *   Page 1 — Cover + summary
 *   Page 2 — Signups by week (bar chart drawn with <View>s)
 *   Page 3 — Users by role + Users by status
 *   Page 4 — Email verification + footer
 *
 * The component is fully self-contained — pass the report and it
 * renders. The PDF route handler is the only caller.
 */

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 60,
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  // Cover
  brand: {
    fontSize: 9,
    letterSpacing: 2,
    color: "#6b6b6b",
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginTop: 8,
    color: "#0a0a0a",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b6b6b",
    marginTop: 6,
  },
  divider: {
    borderBottomColor: "#2a2a2a",
    borderBottomWidth: 1,
    marginVertical: 24,
  },
  // Summary cards
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f4f1eb",
    borderRadius: 6,
    padding: 12,
  },
  summaryLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: "#6b6b6b",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 4,
    color: "#0a0a0a",
  },
  // Section heading
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0a0a0a",
    marginBottom: 12,
  },
  // Weekly chart
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  chartLabel: {
    width: 80,
    fontSize: 9,
    color: "#6b6b6b",
  },
  chartBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#f4f1eb",
    borderRadius: 2,
    marginRight: 8,
  },
  chartBarFill: {
    height: 12,
    backgroundColor: "#8B6914",
    borderRadius: 2,
  },
  chartValue: {
    width: 28,
    fontSize: 9,
    textAlign: "right",
    color: "#0a0a0a",
  },
  // Tables
  tableHeader: {
    flexDirection: "row",
    borderBottomColor: "#2a2a2a",
    borderBottomWidth: 1,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 700,
    color: "#6b6b6b",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomColor: "#e8e3d8",
    borderBottomWidth: 0.5,
  },
  tableCell: {
    fontSize: 10,
    color: "#1a1a1a",
  },
  tableCellMuted: {
    fontSize: 10,
    color: "#6b6b6b",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#6b6b6b",
  },
});

function PageFooter({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text>CareerBridge · User Report</Text>
      <Text>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}

export function UserReportDocument({
  report,
  generatedAt,
}: {
  report: UserGrowthReport;
  generatedAt: Date;
}) {
  // Compute the bar chart max once, used to scale all bars.
  const chartMax = Math.max(1, ...report.signupsByWeek.map((w) => w.count));
  const verifiedPct =
    report.total > 0
      ? Math.round((report.verification.verified / report.total) * 100)
      : 0;
  const firstSignup = report.firstSignupAt
    ? report.firstSignupAt.toISOString().slice(0, 10)
    : "—";

  // Render-only — totalPages is determined by the renderer; we render 4
  // pages deterministically.
  const TOTAL_PAGES = 4;

  return (
    <Document
      title="CareerBridge User Report"
      author="CareerBridge Admin"
      subject="User growth and account breakdown"
    >
      {/* Page 1 — Cover + summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>CAREERBRIDGE</Text>
        <Text style={styles.title}>User Growth Report</Text>
        <Text style={styles.subtitle}>
          Generated {generatedAt.toISOString().replace("T", " ").slice(0, 19)} UTC
        </Text>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total users</Text>
            <Text style={styles.summaryValue}>{report.total}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Signups · last 7 days</Text>
            <Text style={styles.summaryValue}>{report.signupsLast7Days}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Email verified</Text>
            <Text style={styles.summaryValue}>
              {report.verification.verified} ({verifiedPct}%)
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Suspended accounts</Text>
            <Text style={styles.summaryValue}>
              {report.usersByStatus.SUSPENDED}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.tableCell}>
          CareerBridge currently has {report.total} registered users across
          four roles, {report.verification.verified} of whom have verified
          their email addresses. The first signup was recorded on {firstSignup}.
        </Text>
        <Text style={[styles.tableCell, { marginTop: 8 }]}>
          The pages that follow break this down by week, role, and account
          status, and show the email-verification ratio in more detail.
        </Text>

        <PageFooter pageNumber={1} totalPages={TOTAL_PAGES} />
      </Page>

      {/* Page 2 — Signups by week */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Signups by week</Text>
        {report.signupsByWeek.length === 0 ? (
          <Text style={styles.tableCellMuted}>No signups yet.</Text>
        ) : (
          report.signupsByWeek.map((w) => {
            const widthPct = Math.max(2, (w.count / chartMax) * 100);
            return (
              <View key={w.weekStart.toISOString()} style={styles.chartRow}>
                <Text style={styles.chartLabel}>
                  {w.weekStart.toISOString().slice(0, 10)}
                </Text>
                <View style={styles.chartBarTrack}>
                  <View
                    style={[styles.chartBarFill, { width: `${widthPct}%` }]}
                  />
                </View>
                <Text style={styles.chartValue}>{w.count}</Text>
              </View>
            );
          })
        )}

        <View style={styles.divider} />

        <Text style={styles.tableCellMuted}>
          Each bar represents one ISO week (Monday–Sunday, UTC). Bar lengths
          are scaled to the highest week in the trailing 12-week window.
        </Text>

        <PageFooter pageNumber={2} totalPages={TOTAL_PAGES} />
      </Page>

      {/* Page 3 — Users by role + Users by status */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Users by role</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Role</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
            Count
          </Text>
        </View>
        {(
          [
            ["Students", report.usersByRole.STUDENT],
            ["Employees", report.usersByRole.EMPLOYEE],
            ["Employers", report.usersByRole.EMPLOYER],
            ["Admins", report.usersByRole.ADMIN],
          ] as const
        ).map(([label, count]) => (
          <View key={label} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{label}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
              {count}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Users by status</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
            Count
          </Text>
        </View>
        {(
          [
            ["Active", report.usersByStatus.ACTIVE],
            ["Pending", report.usersByStatus.PENDING],
            ["Suspended", report.usersByStatus.SUSPENDED],
          ] as const
        ).map(([label, count]) => (
          <View key={label} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{label}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
              {count}
            </Text>
          </View>
        ))}

        <PageFooter pageNumber={3} totalPages={TOTAL_PAGES} />
      </Page>

      {/* Page 4 — Email verification + footer */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Email verification</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>State</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "right" }]}>
            Count
          </Text>
        </View>
        {(
          [
            ["Verified", report.verification.verified],
            ["Unverified", report.verification.unverified],
          ] as const
        ).map(([label, count]) => (
          <View key={label} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{label}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: "right" }]}>
              {count}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.tableCellMuted}>
          This report is generated live on each request from the
          CareerBridge database. The figures reflect the state of the
          platform at the timestamp shown on page 1. Re-run the report
          any time to refresh.
        </Text>

        <PageFooter pageNumber={4} totalPages={TOTAL_PAGES} />
      </Page>
    </Document>
  );
}
