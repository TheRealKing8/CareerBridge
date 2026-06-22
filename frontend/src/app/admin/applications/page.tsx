import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="Applications"
      description="Read-only platform-wide application log. Useful for spotting abuse patterns and supporting appeals."
    />
  );
}