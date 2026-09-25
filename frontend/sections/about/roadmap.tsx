import { Card, CardContent } from "@/components/ui/card";

const roadmap = [
  {
    title: "Completed",
    status: "Completed",
    emoji: "✅",
    items: [
      "Landing Page",
      "Authentication",
      "Dashboard",
      "User Profiles",
      "Responsive Design",
    ],
  },
  {
    title: "In Progress",
    status: "Building Now",
    emoji: "🚧",
    items: [
      "AI Reports",
      "Advanced Analytics",
      "RAG Optimization",
      "Competitor Insights",
    ],
  },
  {
    title: "Coming Next",
    status: "Next Release",
    emoji: "🔜",
    items: [
      "Team Workspaces",
      "Saved Reports",
      "Email Notifications",
      "Custom Dashboards",
    ],
  },
  {
    title: "Future Vision",
    status: "Long-Term",
    emoji: "🚀",
    items: [
      "Browser Extension",
      "Mobile Application",
      "Slack Integration",
      "Public API",
    ],
  },
];

export function RoadmapSection() {
  return (
    <section
      id="roadmap"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Roadmap
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Building the Future, One Release at a Time
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Every milestone moves us closer to our vision of making
            AI-powered market intelligence accessible, reliable,
            and valuable for every team.
          </p>

        </div>

        {/* Roadmap */}

        <div className="mt-20 grid gap-8 lg:grid-cols-2">

          {roadmap.map((phase) => (
            <Card
              key={phase.title}
              className="rounded-3xl transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-8">

                <div className="flex items-center gap-4">

                  <div className="text-4xl">
                    {phase.emoji}
                  </div>

                  <div>

                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                      {phase.status}
                    </p>

                    <h3 className="text-2xl font-bold">
                      {phase.title}
                    </h3>

                  </div>

                </div>

                <ul className="mt-8 space-y-4">

                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />

                      <span className="text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}

                </ul>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Bottom */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <h3 className="text-2xl font-bold">
            Our Journey Is Just Beginning
          </h3>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We continuously improve the platform based on user
            feedback, emerging technologies, and our vision of
            building the most trusted AI-powered market
            intelligence platform.
          </p>

        </div>

      </div>
    </section>
  );
}