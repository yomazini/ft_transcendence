import { Card, CardContent } from "@/components/ui/card";

const reasons = [
  {
    emoji: "💬",
    title: "Product Questions",
    description:
      "Learn more about our features, pricing, roadmap, or how InsightFlow can fit your workflow.",
  },
  {
    emoji: "🛠",
    title: "Technical Support",
    description:
      "Need help using the platform? Our support team is ready to resolve issues and answer technical questions.",
  },
  {
    emoji: "💼",
    title: "Enterprise & Sales",
    description:
      "Looking for custom solutions, enterprise plans, or a personalized product demonstration? Let's talk.",
  },
  {
    emoji: "🤝",
    title: "Partnership Opportunities",
    description:
      "We're always open to collaborating with startups, agencies, creators, and technology partners.",
  },
  {
    emoji: "🚀",
    title: "Feature Requests",
    description:
      "Your feedback helps shape the future of InsightFlow. Tell us what you'd like to see next.",
  },
  {
    emoji: "🐞",
    title: "Report a Bug",
    description:
      "Found an issue? Let us know and we'll investigate it as quickly as possible.",
  },
];

export function WhyContactSection() {
  return (
    <section
      id="why-contact"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Why Contact Us
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            We're Here to Help You Succeed
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Whether you have a question, need technical assistance,
            or want to explore new opportunities, our team is ready
            to provide the right support.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {reasons.map((reason) => (
            <Card
              key={reason.title}
              className="rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-8">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
                  {reason.emoji}
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {reason.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {reason.description}
                </p>

              </CardContent>
            </Card>
          ))}

        </div>

        {/* Bottom Message */}

        <div className="mx-auto mt-20 max-w-4xl rounded-3xl border bg-muted/30 p-10 text-center">

          <h3 className="text-3xl font-bold">
            Every Conversation Matters
          </h3>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We believe the best products are built through collaboration.
            Whether you're sharing feedback, asking a question, or exploring
            a partnership, every message helps us improve and grow.
          </p>

        </div>

      </div>
    </section>
  );
}