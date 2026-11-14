import { Navbar } from "@/components/navbar";

import { HeroSection } from "@/sections/about/hero";
import { MissionSection } from "@/sections/about/mission";
// import { StorySection } from "@/sections/about/story";
// import { TeamSection } from "@/sections/about/team";
import { CultureSection } from "@/sections/about/culture";
// import { GallerySection } from "@/sections/about/gallery";
// import { DevelopmentProcessSection } from "@/sections/about/development-process";
// import { TechnologiesSection } from "@/sections/about/technologies";
import { ValuesSection } from "@/sections/about/values";
// import { StatisticsSection } from "@/sections/about/statistics";
// import { RoadmapSection } from "@/sections/about/roadmap";
// import { CommunitySection } from "@/sections/about/community";
// import { FAQSection } from "@/sections/about/faq";
// import { FinalCTASection } from "@/sections/about/final-cta";
import { FooterSection } from "@/components/footer";

export default function AboutPage() {
  return (
    <>

      <HeroSection />

      <MissionSection />


      <CultureSection />

      <ValuesSection />
    </>
  );
}