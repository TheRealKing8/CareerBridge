import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ValueProps } from "@/components/landing/ValueProps";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { TopCompanies } from "@/components/landing/TopCompanies";
import { CareerResources } from "@/components/landing/CareerResources";
import { FooterCTA } from "@/components/landing/FooterCTA";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ValueProps />
        <FeaturedJobs />
        <TopCompanies />
        <CareerResources />
        <FooterCTA />
      </main>
    </>
  );
}