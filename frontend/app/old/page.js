import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/sections/hero";
// import { TrustedBySection } from "@/sections/trusted-by";
import { ProblemSection } from "@/sections/problem";
import { FeaturesSection } from "@/sections/features";
import { ProductPreviewSection } from "@/sections/product-preview";
import { WorkflowSection } from "@/sections/workflow";
import { AnalyticsSection } from "@/sections/analytics";
import { TestimonialsSection } from "@/sections/testimonials";
import { PricingSection } from "@/sections/pricing";
import { FAQSection } from "@/sections/faq";
import { FinalCTASection } from "@/sections/final-cta";
import { FooterSection } from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      {/* <TrustedBySection /> */}
      <ProblemSection />
      <FeaturesSection />
      <ProductPreviewSection />
      <WorkflowSection />
      <AnalyticsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <FooterSection />
    </main>
  );
}