import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const info = [
  {
    emoji: "📍",
    title: "Office",
    value: "Casablanca, Morocco",
    description: "Our primary location for collaboration and meetings.",
  },
  {
    emoji: "🕒",
    title: "Working Hours",
    value: "Monday – Friday",
    description: "09:00 AM – 06:00 PM (GMT+1)",
  },
  {
    emoji: "📧",
    title: "Email",
    value: "hello@insightflow.ai",
    description: "We usually reply within one business day.",
  },
  {
    emoji: "🌍",
    title: "Time Zone",
    value: "GMT+1",
    description: "Serving customers around the world.",
  },
];

export function OfficeSection() {
  return (
    <section
      id="office"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Office
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Visit or Reach Us
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you're looking for support, partnership
            opportunities, or simply want to say hello,
            we're always happy to connect.
          </p>

        </div>

        {/* Content */}

        <div className="mt-20 grid gap-10 lg:grid-cols-[420px_1fr]">

          {/* Info */}

          <div className="space-y-6">

            {info.map((item) => (
              <Card
                key={item.title}
                className="rounded-3xl"
              >
                <CardContent className="flex items-start gap-5 p-6">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl">
                    {item.emoji}
                  </div>

                  <div>

                    <h3 className="text-xl font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 font-medium">
                      {item.value}
                    </p>

                    <p className="mt-2 text-muted-foreground">
                      {item.description}
                    </p>

                  </div>

                </CardContent>
              </Card>
            ))}

          </div>

          {/* Map */}

          <Card className="overflow-hidden rounded-3xl">

            <CardContent className="p-0">

              <iframe
                title="Office Location"
                src="https://maps.google.com/maps?q=Casablanca&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="h-[600px] w-full border-0"
                loading="lazy"
              />

            </CardContent>

          </Card>

        </div>

        {/* Bottom CTA */}

        <div className="mt-16 rounded-3xl border bg-muted/30 p-10 text-center">

          <h3 className="text-3xl font-bold">
            Prefer a Virtual Meeting?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            We work with clients and partners worldwide.
            Schedule an online meeting and let's discuss
            how we can help your business grow.
          </p>

          <Link
            href="/contact#contact-form"
            className="mt-8 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Schedule a Meeting
          </Link>

        </div>

      </div>
    </section>
  );
}