import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { NavItem } from "@/components/dashboard/Sidebar";
import { getDashboardTheme } from "@/lib/theme";

const items: readonly NavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/applications", label: "My Applications" },
  { href: "/dashboard/saved", label: "Saved Jobs" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/notifications", label: "Notifications" },
  { href: "/dashboard/ai", label: "CareerBridge AI" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["STUDENT", "EMPLOYEE"]);
  const titlePrefix = user.role === "EMPLOYEE" ? "Employee" : "Student";
  const theme = await getDashboardTheme();
  return (
    <div data-dash-theme={theme} className="contents">
      <DashboardShell user={user} items={items} titlePrefix={titlePrefix} theme={theme}>
        {children}
      </DashboardShell>
    </div>
  );
}