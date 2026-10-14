import { Card, CardContent } from "@/components/ui/card";

const culture = [
  {
    emoji: "💡",
    title: "Innovation",
    description:
      "We constantly explore new ideas, technologies, and better ways to solve real-world problems.",
  },
  {
    emoji: "🤝",
    title: "Collaboration",
    description:
      "Great products are built by great teams. We learn from each other and celebrate every success together.",
  },
  {
    emoji: "🎯",
    title: "Ownership",
    description:
      "Every team member takes responsibility for quality, reliability, and delivering meaningful results.",
  },
  {
    emoji: "📚",
    title: "Continuous Learning",
    description:
      "Technology never stands still, and neither do we. We improve our skills every day.",
  },
  {
    emoji: "🔒",
    title: "Quality First",
    description:
      "From design to deployment, we believe every detail contributes to a better user experience.",
  },
  {
    emoji: "🚀",
    title: "Customer Focus",
    description:
      "Every feature begins with understanding real user needs and delivering measurable value.",
  },
];

export function CultureSection() {
  return (
    <section
      id="culture"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Culture
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            The Values That Shape Everything We Build
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Behind every feature is a team driven by curiosity, collaboration,
            and a commitment to building software that creates real impact.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {culture.map((item) => (
            <Card
              key={item.title}
              className="rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-8">

                <div className="text-5xl">
                  {item.emoji}
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Quote */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <p className="text-2xl font-semibold italic leading-relaxed">
            "We believe great software isn't just built with code—
            it's built with curiosity, teamwork, and an obsession
            with solving real problems."
          </p>

        </div>

      </div>
    </section>
  );
}