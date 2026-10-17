"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for individuals exploring market insights.",
    button: "Get started",
    highlighted: false,
    features: [
      "5 AI reports / month",
      "Basic sentiment analysis",
      "1 workspace",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    description: "Built for startups and growing product teams.",
    button: "Start free trial",
    highlighted: true,
    features: [
      "Unlimited AI reports",
      "Competitor analysis",
      "AI search (RAG)",
      "Real-time monitoring",
      "Export PDF & CSV",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Advanced security and collaboration for large teams.",
    button: "Contact sales",
    highlighted: false,
    features: [
      "Unlimited workspaces",
      "Dedicated infrastructure",
      "Custom integrations",
      "SSO authentication",
      "Role-based permissions",
      "Dedicated success manager",
    ],
  },
];

export function PricingSection() {
  return (<section id="pricing" className="border-b py-24"> <div className="mx-auto max-w-7xl px-6">
    {/* Heading */} <div className="mx-auto max-w-3xl text-center"> <span className="text-sm font-semibold uppercase tracking-widest text-orange-500">
      Pricing </span>


      <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
        Simple pricing for every team
      </h2>

      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        Start for free, scale as your team grows, and unlock powerful
        AI-driven market intelligence without hidden fees.
      </p>
    </div>

    {/* Pricing Cards */}
    <div className="mt-16 grid gap-8 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative ${plan.highlighted ? "lg:-my-4" : ""
            }`}
        >
          {plan.highlighted ? (
            <div className="h-full rounded-[28px] bg-gradient-to-b from-orange-500 to-orange-500/40 p-px shadow-[0_20px_60px_-15px_rgba(249,115,22,0.35)]">
              <Card className="h-full rounded-[27px] border-0 bg-background">
                <CardContent className="flex h-full flex-col p-8">
                  <div className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>

                  <h3 className="text-2xl font-bold">{plan.name}</h3>

                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-5xl font-bold">
                      {plan.price}
                    </span>

                    {plan.price !== "Custom" && (
                      <span className="pb-2 text-muted-foreground">
                        /month
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-muted-foreground">
                    {plan.description}
                  </p>

                  <ul className="mt-8 flex-1 space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
                          <Check
                            className="h-3.5 w-3.5"
                            strokeWidth={2.5}
                          />
                        </span>

                        <span className="text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button className="mt-10 w-full bg-orange-500 text-white hover:bg-orange-600">
                    {plan.button}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full rounded-[27px] border-border/60 bg-card/50 transition-colors duration-300 hover:border-orange-500/30">
              <CardContent className="flex h-full flex-col p-8">
                <h3 className="text-2xl font-bold">{plan.name}</h3>

                <div className="mt-4 flex items-end gap-2">
                  <span className="text-5xl font-bold">
                    {plan.price}
                  </span>

                  {plan.price !== "Custom" && (
                    <span className="pb-2 text-muted-foreground">
                      /month
                    </span>
                  )}
                </div>

                <p className="mt-4 text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="mt-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <Check
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        strokeWidth={2.5}
                      />

                      <span className="text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="mt-10 w-full">
                  {plan.button}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  </div>
  </section>


  );
}
