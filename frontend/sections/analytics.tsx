"use client";

import { Card, CardContent } from "@/components/ui/card";

const analytics = [
{
title: "Customer sentiment",
value: 72,
suffix: "%",
subtitle: "Positive discussions",
description:
"Understand how customers feel about products through AI-powered sentiment analysis.",
},
{
title: "Trending topics",
value: 14,
suffix: "",
subtitle: "Topics discovered",
description:
"Automatically identify the subjects customers discuss the most across Reddit.",
},
{
title: "Competitors tracked",
value: 28,
suffix: "",
subtitle: "Active products",
description:
"Monitor competitors and compare customer opinions side by side.",
},
{
title: "AI reports",
value: 148,
suffix: "",
subtitle: "Generated this month",
description:
"Receive executive summaries and actionable insights in just a few minutes.",
},
];

export function AnalyticsSection() {
return ( <section id="analytics" className="border-b py-24"> <div className="mx-auto max-w-7xl px-6">
{/* Heading */} <div className="mx-auto max-w-3xl text-center"> <span className="text-sm font-semibold uppercase tracking-widest text-orange-500">
Analytics </span>


      <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
        Insights that drive better decisions
      </h2>

      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        Transform thousands of Reddit discussions into measurable
        insights. Discover customer sentiment, trending topics,
        competitor performance, and AI-powered recommendations — all in
        one place.
      </p>
    </div>

    {/* Analytics Cards */}
    <div className="mt-16 grid gap-6 md:grid-cols-2">
      {analytics.map((item) => (
        <Card
          key={item.title}
          className="rounded-2xl border-border/60 bg-card/50 transition-colors duration-300 hover:border-orange-500/30"
        >
          <CardContent className="p-8">
            <p className="text-sm font-medium text-muted-foreground">
              {item.title}
            </p>

            <h3 className="mt-3 text-5xl font-bold tabular-nums">
              {item.value}
              {item.suffix}
            </h3>

            <p className="mt-2 font-medium text-orange-500">
              {item.subtitle}
            </p>

            <p className="mt-6 leading-7 text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Bottom Summary */}
    <div className="relative mt-16 rounded-[28px] bg-gradient-to-b from-orange-500/30 via-border to-border p-px">
      <div className="rounded-[27px] bg-background p-10">
        <div className="max-w-4xl">
          <h3 className="text-2xl font-bold">
            AI-powered business intelligence
          </h3>

          <p className="mt-6 leading-8 text-muted-foreground">
            Every report combines Reddit discussions, customer
            sentiment, recurring pain points, feature requests, and
            competitor analysis into a single, easy-to-understand
            summary — helping product teams make faster and smarter
            decisions.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


);
}
