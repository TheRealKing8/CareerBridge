import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <PlaceholderPanel
      title="Profile"
      description="Editable profile: university, course, graduation year, bio, phone, links (LinkedIn, GitHub, portfolio), and CV upload. Phase 2c adds the form + Cloudinary."
    />
  );
}