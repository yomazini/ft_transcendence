import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const communities = [
  {
    emoji: "🐙",
    title: "GitHub",
    description:
      "Explore our repositories, report bugs, request features, and contribute to the project.",
    button: "View GitHub",
    href: "https://github.com/",
  },
  {
    emoji: "📚",
    title: "Documentation",
    description:
      "Read tutorials, API references, and developer guides to get started quickly.",
    button: "Read Docs",
    href: "/docs",
  },
  {
    emoji: "💬",
    title: "Discord",
    description:
      "Join the community, ask questions, share ideas, and connect with other developers.",
    button: "Join Discord",
    href: "#",
  },
  {
    emoji: "🐦",
    title: "X (Twitter)",
    description:
      "Follow product announcements, feature releases, and company updates.",
    button: "Follow Us",
    href: "#",
  },
];

const stats = [
  {
    value: "500+",
    label: "Developers",
  },
  {
    value: "25+",
    label: "Contributors",
  },
  {
    value: "100+",
    label: "Community Discussions",
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
            Community
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Join Our Community
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Connect with our team, explore resources, and collaborate
            with developers building the future of AI-powered market intelligence.
          </p>

        </div>

        {/* Community Cards */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {communities.map((item) => (
            <Card
              key={item.title}
              className="rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="flex h-full flex-col p-8">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
                  {item.emoji}
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 flex-1 leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <Button
                  
                  className="mt-8 w-full"
                >
                  <Link href={item.href}>
                    {item.button}
                  </Link>
                </Button>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Stats */}

        <div className="mt-20 rounded-3xl border bg-muted/30 p-10">

          <div className="grid gap-8 md:grid-cols-3">

            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center"
              >
                <p className="text-4xl font-bold">
                  {stat.value}
                </p>

                <p className="mt-2 text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}