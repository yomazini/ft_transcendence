import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const options = [
  {
    emoji: "📧",
    title: "General Inquiries",
    description:
      "Questions about our platform, features, documentation, or getting started.",
    button: "Contact Us",
    href: "#contact-form",
  },
  {
    emoji: "🛠",
    title: "Technical Support",
    description:
      "Need help with your account or experiencing a technical issue? We're here to help.",
    button: "Get Support",
    href: "#contact-form",
  },
  {
    emoji: "💼",
    title: "Sales",
    description:
      "Interested in enterprise plans, pricing, or scheduling a personalized demo?",
    button: "Talk to Sales",
    href: "#contact-form",
  },
  {
    emoji: "🤝",
    title: "Partnerships",
    description:
      "Looking to collaborate, integrate, or explore partnership opportunities?",
    button: "Partner With Us",
    href: "#contact-form",
  },
];

export function ContactOptionsSection() {
  return (
    <section
      id="contact-options"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Contact Options
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Choose the Right Team
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you have a question, need technical assistance,
            or want to discuss a partnership, we'll connect you
            with the right people.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {options.map((option) => (
            <Card
              key={option.title}
              className="rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="flex h-full flex-col p-8">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
                  {option.emoji}
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {option.title}
                </h3>

                <p className="mt-4 flex-1 leading-7 text-muted-foreground">
                  {option.description}
                </p>

                <Button
                  
                  className="mt-8 w-full"
                >
                  <Link href={option.href}>
                    {option.button}
                  </Link>
                </Button>

              </CardContent>
            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}