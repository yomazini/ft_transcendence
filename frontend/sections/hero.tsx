// sections/hero.tsx
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const signals = [
  "\u201cSupport takes 3+ days to respond\u201d",
  "\u201cPricing is confusing for teams\u201d",
  "\u201cNo Slack integration, dealbreaker\u201d",
  "\u201cOnboarding took way too long\u201d",
  "\u201cSwitched after a bad migration\u201d",
  "\u201cWish it had a mobile app\u201d",
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      {/* Background — fine grid + single soft glow + grain */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)/0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)/0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 55% 45% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 45% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[140px]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
        {/* Status badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm font-medium backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
          </span>
          Live — scanning 2.4M+ Reddit threads right now
        </div>

        {/* Heading */}
        <h1 className="max-w-4xl text-5xl font-medium leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
          Turn Reddit chaos into{" "}
          <span className="relative inline-block font-extrabold">
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              product intelligence
            </span>
            <svg
              className="absolute -bottom-2 left-0 w-full text-orange-500/70"
              viewBox="0 0 300 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M2 8.5C60 3 120 3 150 6C180 9 240 9.5 298 4"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
          Discover what customers really think about your competitors.
          Analyze thousands of Reddit discussions, surface real pain
          points, and generate AI-powered reports in minutes instead of
          days.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="group bg-orange-500 text-white shadow-[0_8px_30px_-6px_rgba(249,115,22,0.5)] hover:bg-orange-600"
          >
            <Link href="/register" className="flex space-x-1 items-center">
              Start free
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>

          <Button size="lg" variant="outline" className="gap-2">
            <PlayCircle className="h-4 w-4" />
            Watch demo
          </Button>
        </div>

        {/* Signal ticker */}
        <div className="relative mt-16 w-full max-w-3xl overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-3">
            {[...signals, ...signals].map((quote, i) => (
              <span
                key={i}
                className="shrink-0 rounded-full border bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground"
              >
                {quote}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground/70">
          Real signal, extracted automatically
        </p>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}