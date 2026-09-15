import { Card, CardContent } from "@/components/ui/card";

const technologies = [
  {
    category: "Frontend",
    tech: "Next.js",
    description:
      "Builds a fast, modern, and responsive user interface with server-side rendering and optimized performance.",
  },
  {
    category: "Backend",
    tech: "FastAPI",
    description:
      "Provides high-performance APIs for processing requests, authentication, and business logic.",
  },
  {
    category: "Artificial Intelligence",
    tech: "Gemini",
    description:
      "Generates summaries, extracts insights, and helps transform Reddit discussions into actionable information.",
  },
  {
    category: "Database",
    tech: "PostgreSQL",
    description:
      "Stores users, reports, analytics, and application data with reliability and scalability.",
  },
  {
    category: "Containers",
    tech: "Docker",
    description:
      "Packages every service into reproducible containers for consistent development and deployment.",
  },
  {
    category: "Orchestration",
    tech: "Kubernetes",
    description:
      "Manages deployments, scaling, and availability across containerized services.",
  },
  {
    category: "CI/CD",
    tech: "GitHub Actions",
    description:
      "Automates testing, building, and deployment to deliver updates quickly and reliably.",
  },
  {
    category: "Monitoring",
    tech: "Grafana",
    description:
      "Visualizes application metrics and infrastructure health to ensure stable performance.",
  },
  {
    category: "Security",
    tech: "JWT Authentication",
    description:
      "Protects user sessions and secures access to application resources.",
  },
];

export function TechnologiesSection() {
  return (
    <section
      id="technologies"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Technologies
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Powered by Modern Technologies
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We carefully select every technology to build a platform
            that is fast, scalable, secure, and ready for the future.
          </p>

        </div>

        {/* Grid */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {technologies.map((item) => (
            <Card
              key={item.tech}
              className="rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-8">

                <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {item.category}
                </span>

                <h3 className="mt-3 text-2xl font-bold">
                  {item.tech}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {item.description}
                </p>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Bottom Note */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <h3 className="text-2xl font-bold">
            Built with the Right Tool for Every Job
          </h3>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our technology choices prioritize developer productivity,
            application performance, and long-term maintainability.
            This allows us to continuously deliver reliable features
            while keeping the platform scalable as it grows.
          </p>

        </div>

      </div>
    </section>
  );
}