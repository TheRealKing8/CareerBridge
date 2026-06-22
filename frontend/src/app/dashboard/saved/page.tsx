import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="Saved jobs"
      description="The list of jobs you've saved for later, with one-click apply and unsave. Will read from the SavedJob table."
    />
  );
}