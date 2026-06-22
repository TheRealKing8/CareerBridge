import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="My jobs"
      description="The list of jobs your company has posted, with edit, close, and reopen actions. Will read from the Job table."
    />
  );
}