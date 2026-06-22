import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="Applicants"
      description="All applicants across your jobs, grouped by listing. Filter by status (submitted / under review / shortlisted / rejected). Will read from the Application table."
    />
  );
}