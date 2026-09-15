// sections/problem.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Search, Clock, Lightbulb, Sparkles, CheckCircle2 } from "lucide-react";

const problems = [
  {
    icon: Search,
    title: "Manual research",
    description:
      "Searching multiple subreddits, opening hundreds of posts, and reading endless comment threads takes valuable time.",
  },
  {
    icon: Clock,
    title: "Hours wasted",
    description:
      "Understanding customer opinions requires reviewing thousands of comments before finding meaningful insights.",
  },
  {
    icon: Lightbulb,
    title: "Missed opportunities",
    description:
      "Important feature requests, recurring pain points, and competitor weaknesses are often buried inside discussions.",
  },
];

const capabilities = [
  "Automatically collects discussions across relevant subreddits",
  "Analyzes sentiment and tone across every thread",
  "Identifies recurring pain points and competitor gaps",
  "Delivers a clear, actionable report in minutes",
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative border-b py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            The problem
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Stop reading thousands of Reddit comments
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Product research shouldn&apos;t require hours of scrolling through
            Reddit. Valuable customer feedback is everywhere — but finding
            the right insights is slow, repetitive, and frustrating.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {problems.map((problem) => {
            const Icon = problem.icon;
            return (
              <Card
                key={problem.title}
                className="group rounded-2xl border-border/60 bg-card/50 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_12px_40px_-12px_rgba(249,115,22,0.15)]"
              >
                <CardContent className="p-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors group-hover:bg-orange-500/15">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    {problem.title}
                  </h3>

                  <p className="mt-3 leading-7 text-muted-foreground">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Solution */}
        <div className="relative mx-auto mt-20 max-w-4xl rounded-[28px] bg-gradient-to-b from-orange-500/30 via-border to-border p-px">
          <div className="rounded-[27px] bg-background px-8 py-12 sm:px-14">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <div className="flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                The fix
              </div>

              <h3 className="mt-5 text-3xl font-bold tracking-tight">
                Let AI do the research
              </h3>

              <p className="mt-4 leading-7 text-muted-foreground">
                InsightFlow AI reads Reddit so you don&apos;t have to — so
                you can focus on building better products instead of
                reading comments.
              </p>
            </div>

            <ul className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-3 text-left">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                  <span className="text-sm leading-6 text-foreground/90">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}