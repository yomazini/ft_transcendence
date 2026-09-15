import { Card, CardContent } from "@/components/ui/card";

const process = [
  {
    emoji: "💡",
    title: "Research",
    description:
      "Every feature begins by understanding real user needs, market trends, and customer feedback before writing a single line of code.",
  },
  {
    emoji: "📐",
    title: "Planning",
    description:
      "We define requirements, design the architecture, and break large ideas into clear, manageable development tasks.",
  },
  {
    emoji: "🎨",
    title: "Design",
    description:
      "User experience comes first. We design clean interfaces and intuitive workflows before implementation begins.",
  },
  {
    emoji: "💻",
    title: "Development",
    description:
      "Using modern technologies, we build scalable, maintainable, and well-structured software with a strong focus on quality.",
  },
  {
    emoji: "🧪",
    title: "Testing",
    description:
      "Every feature is reviewed, tested, and refined to ensure reliability, performance, and a consistent user experience.",
  },
  {
    emoji: "🚀",
    title: "Deployment",
    description:
      "Once everything is ready, updates are deployed through automated pipelines, ensuring smooth and reliable releases.",
  },
];

export function DevelopmentProcessSection() {
  return (
    <section
      id="development-process"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Development Process
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            From Idea to Production
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Building great software requires more than writing code.
            Every release follows a structured process focused on
            quality, collaboration, and continuous improvement.
          </p>

        </div>

        {/* Process */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {process.map((step, index) => (
            <div
              key={step.title}
              className="relative"
            >
              <Card className="h-full rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg">

                <CardContent className="p-8">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-4xl">
                    {step.emoji}
                  </div>

                  <h3 className="mt-6 text-2xl font-bold">
                    {step.title}
                  </h3>

                  <p className="mt-4 leading-7 text-muted-foreground">
                    {step.description}
                  </p>

                </CardContent>

              </Card>

              {index !== process.length - 1 && (
                <div className="absolute left-1/2 top-full hidden h-8 w-px -translate-x-1/2 bg-border lg:block" />
              )}
            </div>
          ))}

        </div>

        {/* Bottom Quote */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <h3 className="text-2xl font-bold">
            Quality Is Never an Accident
          </h3>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Every feature we deliver reflects careful planning,
            thoughtful design, rigorous testing, and continuous
            collaboration. Our goal isn't just to ship software—
            it's to build products people genuinely enjoy using.
          </p>

        </div>

      </div>
    </section>
  );
}