import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How quickly will I receive a reply?",
    answer:
      "We aim to respond to all inquiries within one business day. For urgent technical issues, our team prioritizes requests as quickly as possible.",
  },
  {
    question: "What types of inquiries do you handle?",
    answer:
      "We can help with product questions, technical support, enterprise sales, partnerships, billing, feature requests, and general feedback.",
  },
  {
    question: "Do you offer product demonstrations?",
    answer:
      "Yes. If you're interested in learning how InsightFlow can help your organization, you can request a personalized product demonstration through our contact form.",
  },
  {
    question: "Can I request a new feature?",
    answer:
      "Absolutely. We value user feedback and regularly review feature requests when planning future releases.",
  },
  {
    question: "How do I report a bug?",
    answer:
      "You can report bugs using the contact form. Including screenshots, error messages, and steps to reproduce the issue helps us investigate more efficiently.",
  },
  {
    question: "Where can I find documentation?",
    answer:
      "Our documentation includes setup guides, API references, and tutorials to help you get started and make the most of the platform.",
  },
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-5xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Frequently Asked Questions
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Everything You Need to Know
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Before reaching out, you may find the answer below.
            If not, we're always happy to help.
          </p>

        </div>

        {/* FAQ */}

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

        {/* CTA */}

        <div className="mt-20 rounded-3xl border bg-muted/30 p-10 text-center">

          <h3 className="text-3xl font-bold">
            Still Have Questions?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
            If you couldn't find the information you were looking for,
            send us a message and our team will be happy to assist you.
          </p>

          <Button
            
            size="lg"
            className="mt-8"
          >
            <Link href="#contact-form">
              Contact Our Team
            </Link>
          </Button>

        </div>

      </div>
    </section>
  );
}