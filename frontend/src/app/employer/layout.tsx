import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { getDashboardTheme } from "@/lib/theme";

const items: readonly NavItem[] = [
  { href: "/employer", label: "Overview" },
  { href: "/employer/jobs", label: "My Jobs" },
  { href: "/employer/applicants", label: "Applicants" },
  { href: "/employer/profile", label: "Company Profile" },
];

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["EMPLOYER"]);
  const theme = await getDashboardTheme();
  return (
    <div data-dash-theme={theme} className="contents">
      <DashboardShell user={user} items={items} titlePrefix="Employer" theme={theme}>
        {children}
      </DashboardShell>
    </div>
  );
}