import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="Post a new job"
      description="A multi-step form: title, description, type, location, salary range, deadline, and publish. Phase 2c adds the form and the publish flow."
    />
  );
}