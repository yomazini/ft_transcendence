import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProductPreviewSection() {
  return (
    <section
      id="preview"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Product Preview
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            A Dashboard Built for Product Teams
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Transform thousands of Reddit conversations into
            clear reports, competitor insights, and AI-powered
            recommendations—all from one intuitive dashboard.
          </p>

        </div>

        {/* Dashboard */}

        <Card className="mt-20 overflow-hidden rounded-3xl border shadow-xl">

          <CardContent className="p-0">

            <div className="grid lg:grid-cols-[240px_1fr]">

              {/* Sidebar */}

              <aside className="border-r bg-muted/30 p-6">

                <h3 className="text-xl font-bold">
                  InsightFlow
                </h3>

                <nav className="mt-8 space-y-3 text-sm">

                  <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                    Dashboard
                  </div>

                  <div className="rounded-lg px-4 py-2">
                    Analytics
                  </div>

                  <div className="rounded-lg px-4 py-2">
                    AI Reports
                  </div>

                  <div className="rounded-lg px-4 py-2">
                    Competitors
                  </div>

                  <div className="rounded-lg px-4 py-2">
                    Settings
                  </div>

                </nav>

              </aside>

              {/* Main */}

              <div className="space-y-6 p-8">

                {/* Top Cards */}

                <div className="grid gap-4 md:grid-cols-3">

                  <Card>
                    <CardContent className="p-6">

                      <p className="text-sm text-muted-foreground">
                        Positive
                      </p>

                      <h3 className="mt-2 text-3xl font-bold text-green-500">
                        72%
                      </h3>

                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">

                      <p className="text-sm text-muted-foreground">
                        Negative
                      </p>

                      <h3 className="mt-2 text-3xl font-bold text-red-500">
                        18%
                      </h3>

                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">

                      <p className="text-sm text-muted-foreground">
                        Reports
                      </p>

                      <h3 className="mt-2 text-3xl font-bold">
                        148
                      </h3>

                    </CardContent>
                  </Card>

                </div>

                {/* SWOT */}

                <Card>

                  <CardContent className="p-6">

                    <h3 className="text-xl font-semibold">
                      AI SWOT Summary
                    </h3>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">

                      <div className="rounded-xl border p-4">
                        <h4 className="font-semibold text-green-500">
                          Strengths
                        </h4>

                        <p className="mt-2 text-sm text-muted-foreground">
                          Users appreciate flexibility,
                          integrations, and collaboration.
                        </p>
                      </div>

                      <div className="rounded-xl border p-4">
                        <h4 className="font-semibold text-red-500">
                          Weaknesses
                        </h4>

                        <p className="mt-2 text-sm text-muted-foreground">
                          Pricing and performance appear
                          frequently in negative discussions.
                        </p>
                      </div>

                    </div>

                  </CardContent>

                </Card>

                {/* Reddit Posts */}

                <Card>

                  <CardContent className="p-6">

                    <h3 className="text-xl font-semibold">
                      Recent Reddit Discussions
                    </h3>

                    <div className="mt-6 space-y-4">

                      <div className="rounded-lg border p-4">
                        Users love the flexibility but complain
                        about the mobile experience.
                      </div>

                      <div className="rounded-lg border p-4">
                        Pricing is becoming a major concern
                        among startups.
                      </div>

                      <div className="rounded-lg border p-4">
                        AI features are the most requested
                        functionality this month.
                      </div>

                    </div>

                  </CardContent>

                </Card>

              </div>

            </div>

          </CardContent>

        </Card>

        {/* CTA */}

        <div className="mt-12 text-center">

          <Button size="lg">
            Explore the Dashboard
          </Button>

        </div>

      </div>
    </section>
  );
}