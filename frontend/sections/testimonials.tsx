"use client";

import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
{
name: "Sarah Mitchell",
role: "Founder @ LaunchStack",
initials: "SM",
review:
"InsightFlow helped us identify the biggest pain points our competitors were ignoring. We completely changed our roadmap based on the AI reports.",
},
{
name: "David Chen",
role: "Product Manager @ Nova Labs",
initials: "DC",
review:
"Instead of spending hours reading Reddit discussions, our team gets a complete market summary in minutes. It's become part of our weekly product review.",
},
{
name: "Emily Rodriguez",
role: "Growth Lead @ BrightScale",
initials: "ER",
review:
"The sentiment analysis and competitor insights helped us discover opportunities we would have completely missed with manual research.",
},
];

export function TestimonialsSection() {
return ( <section id="testimonials" className="border-b py-24"> <div className="mx-auto max-w-7xl px-6">
{/* Heading */} <div className="mx-auto max-w-3xl text-center"> <span className="text-sm font-semibold uppercase tracking-widest text-orange-500">
Testimonials </span>


      <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
        Trusted by product teams
      </h2>

      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        Founders, product managers, and growth teams use InsightFlow
        to transform Reddit discussions into actionable business
        insights.
      </p>
    </div>

    {/* Testimonials */}
    <div className="mt-16 grid gap-6 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <Card
          key={testimonial.name}
          className="rounded-2xl border-border/60 bg-card/50 transition-colors duration-300 hover:border-orange-500/30"
        >
          <CardContent className="flex h-full flex-col p-8">
            {/* Stars */}
            <div className="flex gap-0.5 text-orange-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-current"
                />
              ))}
            </div>

            {/* Review */}
            <p className="mt-6 flex-1 leading-8 text-muted-foreground">
              &ldquo;{testimonial.review}&rdquo;
            </p>

            {/* User */}
            <div className="mt-8 flex items-center gap-4 border-t border-border/60 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white">
                {testimonial.initials}
              </div>

              <div>
                <h4 className="font-semibold">
                  {testimonial.name}
                </h4>

                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>


);
}
