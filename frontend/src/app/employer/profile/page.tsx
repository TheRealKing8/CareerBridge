import { PlaceholderPanel } from "@/components/dashboard/PlaceholderPanel";

export default function Page() {
  return (
    <PlaceholderPanel
      title="Company profile"
      description="Editable: company name, website, logo (Cloudinary), industry, company size, description, location. Verification status is read-only here — admins verify."
    />
  );
}