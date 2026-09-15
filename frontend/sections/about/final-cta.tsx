import Link from "next/link";

import { Button } from "@/components/ui/button";

const highlights = [
  "Building in public",
  "Continuous innovation",
  "Driven by community feedback",
];

export function FinalCTASection() {
  return (
    <section
      id="join"
      className="py-28"
    >
      <div className="mx-auto max-w-6xl px-6">

        <div className="overflow-hidden rounded-3xl border bg-muted/30">

          <div className="px-8 py-20 text-center md:px-16">

            {/* Badge */}

            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Join Our Journey
            </span>

            {/* Heading */}

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Let's Build the Future Together
            </h2>

            {/* Description */}

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Every great product grows through collaboration,
              curiosity, and the people who believe in its vision.
              Whether you're exploring the platform, sharing
              feedback, or contributing to its future, we're
              excited to have you on this journey.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <Button
                size="lg"
                
              >
                <Link href="/register">
                  Start for Free
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                
              >
                <Link href="/contact">
                  Contact Our Team
                </Link>
              </Button>

            </div>

            {/* Highlights */}

            <div className="mt-12 flex flex-wrap justify-center gap-6">

              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />

                  <span className="text-sm text-muted-foreground">
                    {item}
                  </span>
                </div>
              ))}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}