import { Hero } from "@/components/landing/Hero";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { TopCompanies } from "@/components/landing/TopCompanies";
import { CareerResources } from "@/components/landing/CareerResources";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <FeaturedJobs />
        <TopCompanies />
        <CareerResources />
      </main>
    </>
  );
}