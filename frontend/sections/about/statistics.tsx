import { Card, CardContent } from "@/components/ui/card";

const statistics = [
  {
    value: "4+",
    label: "Team Members",
    description:
      "A multidisciplinary team working together to build a modern AI platform.",
  },
  {
    value: "25+",
    label: "Technologies",
    description:
      "Modern frameworks, cloud services, DevOps tools, and AI technologies.",
  },
  {
    value: "120+",
    label: "Git Commits",
    description:
      "Continuous development, improvements, and collaboration throughout the project.",
  },
  {
    value: "800+",
    label: "Development Hours",
    description:
      "Hundreds of hours spent researching, designing, coding, and testing.",
  },
  {
    value: "35+",
    label: "Features Built",
    description:
      "Authentication, dashboards, AI workflows, analytics, and much more.",
  },
  {
    value: "15+",
    label: "Docker Containers",
    description:
      "Containerized services designed for reliable and scalable deployments.",
  },
];

export function StatisticsSection() {
  return (
    <section
      id="statistics"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            By the Numbers
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Measuring Our Journey
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Every milestone represents hours of collaboration,
            learning, experimentation, and continuous improvement.
          </p>

        </div>

        {/* Statistics Grid */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {statistics.map((item) => (
            <Card
              key={item.label}
              className="rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-8">

                <h3 className="text-5xl font-extrabold text-primary">
                  {item.value}
                </h3>

                <h4 className="mt-4 text-2xl font-semibold">
                  {item.label}
                </h4>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Quote */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <blockquote className="text-2xl font-semibold italic leading-relaxed">
            "Behind every number is a challenge solved, a lesson learned,
            and another step toward building something meaningful."
          </blockquote>

        </div>

      </div>
    </section>
  );
}