import { Card, CardContent } from "@/components/ui/card";

const timeline = [
  {
    year: "2025",
    emoji: "💡",
    title: "The Idea",
    description:
      "The project began with a simple question: How can teams better understand what customers truly think about their products?",
  },
  {
    year: "Research",
    emoji: "🔬",
    title: "Understanding the Problem",
    description:
      "We explored how founders and product managers spend countless hours reading Reddit discussions to discover feedback, trends, and feature requests.",
  },
  {
    year: "Architecture",
    emoji: "🏗",
    title: "Designing the Platform",
    description:
      "We designed a scalable architecture capable of collecting discussions, processing data, and generating AI-powered insights in one unified platform.",
  },
  {
    year: "Development",
    emoji: "💻",
    title: "Building the Product",
    description:
      "Using modern web technologies, cloud infrastructure, and AI, we transformed our vision into a functional platform.",
  },
  {
    year: "Launch",
    emoji: "🚀",
    title: "First Release",
    description:
      "After months of development, testing, and continuous improvement, the first version of the platform became available for users.",
  },
  {
    year: "Today",
    emoji: "🌍",
    title: "Looking Forward",
    description:
      "We're continuously improving InsightFlow with new AI capabilities, better analytics, and features that help teams make smarter product decisions.",
  },
];

export function StorySection() {
  return (
    <section
      id="story"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-5xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Story
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Every Great Product Starts With an Idea
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            InsightFlow wasn't built overnight. It evolved through
            research, collaboration, experimentation, and a shared
            vision of helping teams make better product decisions.
          </p>

        </div>

        {/* Timeline */}

        <div className="relative mt-20">

          {/* Vertical line */}

          <div className="absolute left-6 top-0 hidden h-full w-px bg-border md:block" />

          <div className="space-y-10">

            {timeline.map((item) => (
              <div
                key={item.title}
                className="relative flex gap-6"
              >
                {/* Circle */}

                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border bg-background text-xl">
                  {item.emoji}
                </div>

                {/* Card */}

                <Card className="flex-1 rounded-2xl">
                  <CardContent className="p-8">

                    <span className="text-sm font-semibold text-primary">
                      {item.year}
                    </span>

                    <h3 className="mt-2 text-2xl font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-4 leading-7 text-muted-foreground">
                      {item.description}
                    </p>

                  </CardContent>
                </Card>

              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}