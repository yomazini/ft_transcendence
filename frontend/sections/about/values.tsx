import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    emoji: "🛡️",
    title: "Integrity",
    description:
      "We believe trust is earned through honesty, transparency, and delivering on our promises.",
  },
  {
    emoji: "💡",
    title: "Innovation",
    description:
      "We continuously explore better technologies, smarter solutions, and new ways to solve meaningful problems.",
  },
  {
    emoji: "👥",
    title: "User First",
    description:
      "Every feature begins with understanding our users and creating experiences that truly help them succeed.",
  },
  {
    emoji: "⭐",
    title: "Excellence",
    description:
      "From design to deployment, we care about quality, craftsmanship, and the smallest details.",
  },
  {
    emoji: "🔒",
    title: "Privacy & Security",
    description:
      "Protecting user data and building secure systems is a responsibility we never compromise.",
  },
  {
    emoji: "🌱",
    title: "Continuous Growth",
    description:
      "Learning, improving, and sharing knowledge are essential parts of how we grow as a team.",
  },
];

export function ValuesSection() {
  return (
    <section
      id="values"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Core Values
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            The Principles Behind Every Decision
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our values influence every feature we build, every
            conversation we have, and every decision we make.
            They define how we grow, collaborate, and serve our users.
          </p>

        </div>

        {/* Values */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {values.map((value) => (
            <Card
              key={value.title}
              className="rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-8">

                <div className="text-5xl">
                  {value.emoji}
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {value.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {value.description}
                </p>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Quote */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <blockquote className="text-2xl font-semibold italic leading-relaxed">
            "Our values are more than words—they are the foundation
            of every product we create and every relationship we build."
          </blockquote>

        </div>

      </div>
    </section>
  );
}