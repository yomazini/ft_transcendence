import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    emoji: "🎯",
    title: "Purpose",
    description:
      "Help teams make product decisions based on real customer conversations instead of assumptions.",
  },
  {
    emoji: "💡",
    title: "Innovation",
    description:
      "Build AI-powered tools that simplify complex market research and save valuable time.",
  },
  {
    emoji: "🤝",
    title: "Collaboration",
    description:
      "Create products through teamwork, continuous learning, and shared knowledge.",
  },
];

export function MissionSection() {
  return (
    <section
      id="mission"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left */}

          <div>

            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Our Mission
            </span>

            <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Building Products That Start With Listening
            </h2>

            <p className="mt-8 text-lg leading-8 text-muted-foreground">
              Every day, millions of people share honest opinions,
              frustrations, and ideas online. We believe those
              conversations are one of the most valuable sources
              of product feedback available.
            </p>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our mission is to transform those conversations into
              clear, actionable insights that help founders, product
              managers, and businesses build products people truly
              want. Instead of guessing what customers need, we help
              teams understand what customers are already saying.
            </p>

            <div className="mt-10 rounded-2xl border bg-muted/30 p-6">
              <p className="text-lg font-medium italic">
                "Great products begin with understanding people."
              </p>
            </div>

          </div>

          {/* Right */}

          <div className="grid gap-6">

            {values.map((value) => (
              <Card
                key={value.title}
                className="rounded-2xl"
              >
                <CardContent className="flex items-start gap-5 p-8">

                  <div className="text-4xl">
                    {value.emoji}
                  </div>

                  <div>

                    <h3 className="text-xl font-semibold">
                      {value.title}
                    </h3>

                    <p className="mt-3 leading-7 text-muted-foreground">
                      {value.description}
                    </p>

                  </div>

                </CardContent>
              </Card>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}