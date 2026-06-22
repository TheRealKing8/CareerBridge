import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="Notifications"
      description="Application status updates, new-applicant alerts, and other account events. Will read from the Notification table."
    />
  );
}