import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is InsightFlow?",
    answer:
      "InsightFlow is an AI-powered platform that analyzes Reddit discussions to help founders, startups, and product teams understand customer feedback, competitor weaknesses, and market trends.",
  },
  {
    question: "How does InsightFlow collect data?",
    answer:
      "InsightFlow gathers publicly available Reddit posts and comments related to your search keywords, then uses AI to organize, summarize, and analyze the information into actionable insights.",
  },
  {
    question: "Who is InsightFlow for?",
    answer:
      "It's designed for founders, product managers, marketers, researchers, and anyone who wants to make data-driven product decisions without spending hours reading Reddit threads.",
  },
  {
    question: "Can I analyze my competitors?",
    answer:
      "Yes. Simply search for a competitor's product or company name to discover customer sentiment, recurring complaints, feature requests, and opportunities for improvement.",
  },
  {
    question: "Do I need AI or technical knowledge?",
    answer:
      "No. InsightFlow is built for everyone. Just enter a keyword or competitor, and the platform handles the analysis automatically.",
  },
  {
    question: "Can I export my reports?",
    answer:
      "Yes. You can export AI-generated reports and insights in multiple formats, making it easy to share them with your team or stakeholders.",
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
            Everything you need to know before getting started with InsightFlow.
          </p>

        </div>

        {/* Accordion */}

        <Accordion
          type="single"
          defaultValue={["item-0"]}
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