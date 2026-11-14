import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Background */}

      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,#2563eb20,transparent_60%)]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-28">

        {/* Badge */}

        <div className="rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
          About Our Team
        </div>

        {/* Heading */}

        <h1 className="mt-8 max-w-5xl text-center text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
          <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
           Building </span>  AI Products That Help Teams
          <span className="text-primary bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            {" "}Make Better Decisions
          </span>
        </h1>

        {/* Description */}

        <p className="mt-8 max-w-3xl text-center text-lg leading-8 text-muted-foreground">
          We are a passionate team of developers, designers,
          and engineers building AI-powered tools that transform
          Reddit conversations into actionable business insights.
          Every feature we build is driven by curiosity,
          collaboration, and real customer needs.
        </p>

 

        {/* Image */}


      </div>
    </section>
  );
}