import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { getDashboardTheme } from "@/lib/theme";

const items: readonly NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/employers", label: "Employers" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["ADMIN"]);
  const theme = await getDashboardTheme();
  return (
    <div data-dash-theme={theme} className="contents">
      <DashboardShell user={user} items={items} titlePrefix="Admin" theme={theme}>
        {children}
      </DashboardShell>
    </div>
  );
}