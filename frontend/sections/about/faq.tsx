import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Who is behind InsightFlow?",
    answer:
      "InsightFlow is built by a passionate team of developers, designers, and engineers who share a common goal: helping businesses make better product decisions using AI-powered market intelligence.",
  },
  {
    question: "How did InsightFlow start?",
    answer:
      "The project started with a simple observation: valuable customer feedback is scattered across online communities. We wanted to build a platform that transforms those conversations into actionable insights for product teams.",
  },
  {
    question: "Is InsightFlow open source?",
    answer:
      "Some parts of the project are open source, and we believe in sharing knowledge with the developer community whenever possible.",
  },
  {
    question: "Can I contribute to the project?",
    answer:
      "Absolutely. Whether you're a developer, designer, or simply passionate about technology, we welcome feedback, feature ideas, bug reports, and code contributions.",
  },
  {
    question: "How can I contact the team?",
    answer:
      "You can reach us through our contact page, GitHub repository, or community channels. We're always happy to connect with developers, founders, and curious builders.",
  },
  {
    question: "What technologies power the platform?",
    answer:
      "Our stack includes Next.js, FastAPI, PostgreSQL, Docker, Kubernetes, GitHub Actions, and modern AI technologies that help deliver reliable and scalable software.",
  },
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-4xl px-6">

        {/* Heading */}

        <div className="text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Learn more about our team, our mission, and how we build products.
          </p>

        </div>

        {/* Accordion */}

        <Accordion
          type="single"
          
          className="mt-16"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
            >
              <AccordionTrigger className="text-left text-lg font-semibold">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="leading-7 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}