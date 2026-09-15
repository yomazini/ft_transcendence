"use client";

import { Card, CardContent } from "@/components/ui/card";

const workflow = [
{
number: "01",
title: "Search a keyword",
description:
"Enter a product name, competitor, industry, or any topic you want to analyze.",
},
{
number: "02",
title: "Collect discussions",
description:
"InsightFlow gathers relevant Reddit posts and comments from multiple communities.",
},
{
number: "03",
title: "AI analyzes everything",
description:
"Our AI identifies customer sentiment, recurring pain points, feature requests, and market trends.",
},
{
number: "04",
title: "Receive actionable insights",
description:
"Get SWOT reports, competitor comparisons, AI summaries, and recommendations — all in one dashboard.",
},
];

export function WorkflowSection() {
return ( <section id="workflow" className="border-b py-24"> <div className="mx-auto max-w-7xl px-6">
{/* Heading */} <div className="mx-auto max-w-3xl text-center"> <span className="text-sm font-semibold uppercase tracking-widest text-orange-500">
Workflow </span>


      <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
        From Reddit discussions to business decisions
      </h2>

      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        InsightFlow automates market research so you can spend less time
        reading comments and more time building better products.
      </p>
    </div>

    {/* Steps */}
    <div className="relative mt-20">
      {/* Connecting line - desktop only */}
      <div className="pointer-events-none absolute left-0 right-0 top-40 hidden h-px bg-border lg:block" />

      <div className="grid gap-6 lg:grid-cols-4">
        {workflow.map((step) => (
          <div
            key={step.number}
            className="relative bg-white"
          >
            <Card className="h-full rounded-2xl border-border/60 bg-card/50 transition-colors duration-300 hover:border-orange-500/30">
              <CardContent className="relative p-8">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white shadow-[0_8px_24px_-6px_rgba(249,115,22,0.5)]">
                  {step.number}
                </div>

                <h3 className="mt-6 text-2xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>


);
}
