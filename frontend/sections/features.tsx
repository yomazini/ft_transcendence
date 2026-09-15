// sections/features.tsx
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  BarChart3,
  Target,
  Search,
  Zap,
  FileDown,
} from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Features
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Everything you need to build better products
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From collecting Reddit discussions to generating AI-powered
            insights, InsightFlow gives your team everything needed to
            understand customers, analyze competitors, and make confident
            product decisions.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-16 grid auto-rows-[minmax(220px,auto)] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* AI Reports — hero card */}
          <Card className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)] md:col-span-2">
            <CardContent className="flex h-full flex-col justify-between p-8">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Brain className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">AI reports</h3>
                <p className="mt-3 max-w-md leading-7 text-muted-foreground">
                  Generate executive summaries from thousands of Reddit
                  discussions in seconds — understand customer opinions
                  without reading every comment.
                </p>
              </div>

              {/* mini report mockup */}
              <div className="mt-8 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground/80">
                    Weekly summary — generated 2m ago
                  </span>
                  <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                    AI
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded-full bg-foreground/10" />
                  <div className="h-2 w-4/5 rounded-full bg-foreground/10" />
                  <div className="h-2 w-3/5 rounded-full bg-foreground/10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time monitoring — tall card */}
          <Card className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)] md:row-span-2">
            <CardContent className="flex h-full flex-col p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Zap className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">
                Real-time monitoring
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Continuously monitor Reddit for new discussions so you&apos;re
                always aware of emerging trends and customer feedback.
              </p>

              {/* live feed mockup */}
              <div className="mt-auto space-y-2 pt-8">
                {["r/SaaS", "r/startups", "r/marketing"].map((sub, i) => (
                  <div
                    key={sub}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                    </span>
                    New thread in {sub}
                    <span className="ml-auto text-[10px] text-muted-foreground/60">
                      {i === 0 ? "now" : `${i * 2}m ago`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment analysis */}
          <Card className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)]">
            <CardContent className="flex h-full flex-col p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <BarChart3 className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-xl font-semibold">
                Sentiment analysis
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Track positive, neutral, and negative sentiment to discover
                how people truly feel about products and trends.
              </p>

              <div className="mt-auto flex items-end gap-1.5 pt-8">
                {[40, 70, 55, 90, 65, 80, 50].map((h, i) => (
                  <div
                    key={i}
                    className="w-full rounded-sm bg-orange-500/15"
                    style={{ height: `${h}%`, background: i === 3 ? undefined : undefined }}
                  >
                    <div
                      className="h-full w-full rounded-sm bg-gradient-to-t from-orange-500/60 to-orange-500/10"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor analysis */}
          <Card className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)]">
            <CardContent className="p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Target className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-xl font-semibold">
                Competitor analysis
              </h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Compare competing products side by side and uncover
                strengths, weaknesses, and recurring complaints.
              </p>
            </CardContent>
          </Card>

          {/* AI Search */}
          <Card className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)]">
            <CardContent className="flex h-full flex-col p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <Search className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-xl font-semibold">AI search</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Ask questions in natural language and get AI-powered
                answers backed by relevant Reddit discussions.
              </p>

              <div className="mt-auto flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-2 pt-2 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                &quot;What do users dislike about our onboarding?&quot;
              </div>
            </CardContent>
          </Card>

          {/* Export reports */}
          <Card className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)]">
            <CardContent className="p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                <FileDown className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Export reports</h3>
              <p className="mt-3 leading-7 text-muted-foreground">
                Download AI-generated reports in multiple formats and
                share insights with your team or stakeholders.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}