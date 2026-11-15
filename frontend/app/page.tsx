import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/sections/hero";
import { ProblemSection } from "@/sections/problem";
import { FeaturesSection } from "@/sections/features";
import { PricingSection } from "@/sections/pricing";
import { FAQSection } from "@/sections/faq";
import { FinalCTASection } from "@/sections/final-cta";
import { FooterSection } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <FooterSection />
    </main>
  );
}

