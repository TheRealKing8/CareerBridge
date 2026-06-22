import { requireRole } from "@/lib/session";
import { ReportsView } from "@/components/admin/ReportsView";

// Real, live data on every request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage() {
  await requireRole(["ADMIN"]);
  return <ReportsView />;
}
