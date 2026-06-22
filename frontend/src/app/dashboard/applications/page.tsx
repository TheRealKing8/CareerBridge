import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="My applications"
      description="The full applications list, with status filters, withdrawal, and per-job detail. Will be wired to the Application table with bulk actions for employers."
    />
  );
}