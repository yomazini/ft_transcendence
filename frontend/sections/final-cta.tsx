import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FinalCTASection() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-5xl px-6">

        <div className="rounded-3xl border bg-muted/30 px-8 py-16 text-center md:px-16">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Get Started
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Ready to Build Better Products?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Stop spending hours reading Reddit threads.
            Let InsightFlow analyze customer conversations,
            uncover market opportunities, and deliver actionable
            insights in minutes.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

            <Button size="lg" >
              <Link href="/register">
                Start Free
              </Link>
            </Button>
            
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            No credit card required • Free plan available • Cancel anytime
          </p>

        </div>
      </div>
    </section>
  );
}