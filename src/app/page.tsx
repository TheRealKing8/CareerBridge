import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { TopCompanies } from "@/components/landing/TopCompanies";
import { CareerResources } from "@/components/landing/CareerResources";
import { AiAssistantCta } from "@/components/landing/AiAssistantCta";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturedJobs />
        <TopCompanies />
        <CareerResources />
        <AiAssistantCta />
      </main>
      <SiteFooter />
    </div>
  );
}