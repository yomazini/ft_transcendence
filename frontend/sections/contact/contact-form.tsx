"use client";

import { Mail, Building2, Clock3, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactFormSection() {
  return (
    <section
      id="contact-form"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Contact Form
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            We'd Love to Hear From You
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Fill out the form below and our team will respond as
            quickly as possible.
          </p>

        </div>

        {/* Layout */}

        <div className="mt-20 grid gap-10 lg:grid-cols-[380px_1fr]">

          {/* Left Card */}

          <Card className="rounded-3xl">
            <CardContent className="space-y-8 p-8">

              <div>

                <h3 className="text-2xl font-bold">
                  Contact Information
                </h3>

                <p className="mt-3 text-muted-foreground">
                  Reach out anytime. We're here to answer your
                  questions and help you succeed.
                </p>

              </div>

              <div className="space-y-6">

                <div className="flex items-start gap-4">

                  <Mail className="mt-1 h-5 w-5 text-primary" />

                  <div>

                    <h4 className="font-semibold">
                      Email
                    </h4>

                    <p className="text-muted-foreground">
                      hello@insightflow.ai
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <Building2 className="mt-1 h-5 w-5 text-primary" />

                  <div>

                    <h4 className="font-semibold">
                      Business
                    </h4>

                    <p className="text-muted-foreground">
                      Enterprise & Partnerships
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-4">

                  <Clock3 className="mt-1 h-5 w-5 text-primary" />

                  <div>

                    <h4 className="font-semibold">
                      Response Time
                    </h4>

                    <p className="text-muted-foreground">
                      Within 24 hours
                    </p>

                  </div>

                </div>

              </div>

            </CardContent>
          </Card>

          {/* Form */}

          <Card className="rounded-3xl">
            <CardContent className="p-8">

              <form className="space-y-6">

                <div className="grid gap-6 md:grid-cols-2">

                  <div>

                    <Label>
                      Full Name
                    </Label>

                    <Input
                      placeholder="John Doe"
                      className="mt-2"
                    />

                  </div>

                  <div>

                    <Label>
                      Email Address
                    </Label>

                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="mt-2"
                    />

                  </div>

                </div>

                <div>

                  <Label>
                    Company (Optional)
                  </Label>

                  <Input
                    placeholder="Acme Inc."
                    className="mt-2"
                  />

                </div>

                <div>

                  <Label>
                    Subject
                  </Label>

                  <Input
                    placeholder="How can we help?"
                    className="mt-2"
                  />

                </div>

                <div>

                  <Label>
                    Message
                  </Label>

                  <Textarea
                    rows={7}
                    placeholder="Tell us more about your request..."
                    className="mt-2 resize-none"
                  />

                </div>

                <Button
                  size="lg"
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>

              </form>

            </CardContent>
          </Card>

        </div>

      </div>
    </section>
  );
}