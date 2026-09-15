import Link from "next/link";

import { Button } from "@/components/ui/button";

const highlights = [
  "Response within 24 hours",
  "Friendly human support",
  "Trusted by growing startups",
];

export function FinalCTASection() {
  return (
    <section
      id="final-cta"
      className="py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="overflow-hidden rounded-3xl border bg-muted/30">

          <div className="px-8 py-20 text-center md:px-16">

            {/* Badge */}

            <span className="rounded-full border bg-background px-4 py-2 text-sm font-medium text-muted-foreground">
              Let's Build Something Great Together
            </span>

            {/* Heading */}

            <h2 className="mt-8 text-4xl font-bold tracking-tight md:text-6xl">
              Ready to Connect?
            </h2>

            {/* Description */}

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Whether you're looking for technical support,
              want to explore enterprise solutions,
              schedule a product demo, or simply ask a question,
              our team is always happy to help.
            </p>

            {/* Buttons */}

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <Button
                size="lg"
                
              >
                <Link href="#contact-form">
                  Send us a Message
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                
              >
                <Link href="#">
                  Schedule a Demo
                </Link>
              </Button>

            </div>

            {/* Highlights */}

            <div className="mt-12 flex flex-wrap justify-center gap-8">

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