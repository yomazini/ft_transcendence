import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="border-b">
      <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center px-6">

        <div className="mx-auto max-w-4xl text-center">

          {/* Badge */}

          <span className="rounded-full border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
            We'd love to hear from you
          </span>

          {/* Heading */}

          <h1 className="mt-8 text-5xl font-bold tracking-tight md:text-7xl">
            <span className="text-primary bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Let's</span>  Start a
            <span className="text-primary text-primary bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent"> Conversation</span>
          </h1>

          {/* Description */}

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
            Whether you're looking for product support, have a
            business inquiry, want to explore a partnership,
            or simply have a question, our team is here to help.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <Button
              size="lg"
              
            >
              <Link href="https://www.linkedin.com/in/hamza-khairi-0383902b9/" target="_blank">
                Get in Touch
              </Link>
            </Button>

            

          </div>

          {/* Stats */}

          <div className="mt-14 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Average response in under 24 hours
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Monday – Friday
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Global support
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}