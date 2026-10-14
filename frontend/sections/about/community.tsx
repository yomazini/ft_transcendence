import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const community = [
  {
    title: "GitHub",
    description:
      "Explore our repositories, follow development progress, report issues, and contribute to the project.",
    button: "View Repository",
    href: "https://github.com/",
  },
  {
    title: "Documentation",
    description:
      "Learn how the platform works through developer guides, API documentation, and technical resources.",
    button: "Read Documentation",
    href: "/docs",
  },
  {
    title: "Community",
    description:
      "Connect with the team, ask questions, share ideas, and help shape the future of the platform.",
    button: "Join Community",
    href: "#",
  },
];

export function CommunitySection() {
  return (
    <section
      id="community"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Community & Open Source
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Built Together, Shared Together
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We believe great software grows through collaboration.
            Whether you're reporting a bug, suggesting a feature,
            or contributing code, your ideas help shape the future
            of InsightFlow.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-3">

          {community.map((item) => (
            <Card
              key={item.title}
              className="rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="flex h-full flex-col p-8">

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 flex-1 leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <Button
                  className="mt-8"
                >
                  <Link href={item.href}>
                    {item.button}
                  </Link>
                </Button>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Bottom CTA */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-12 text-center">

          <h3 className="text-3xl font-bold">
            Want to Contribute?
          </h3>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            We're always looking for contributors, developers,
            designers, and enthusiasts who want to help build
            the future of AI-powered market intelligence.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Button >
              <Link href="https://github.com/">
                Become a Contributor
              </Link>
            </Button>

            <Button
              variant="outline"
            >
              <Link href="/contact">
                Contact the Team
              </Link>
            </Button>

          </div>

        </div>

      </div>
    </section>
  );
}