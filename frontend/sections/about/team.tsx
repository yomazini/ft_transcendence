import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const team = [
  {
    name: "Hamza Khairi",
    role: "DevOps Engineer",
    image: "/images/team/hamza.jpg",
    bio:
      "Designs and maintains the cloud infrastructure, CI/CD pipelines, Docker containers, and Kubernetes deployments that power the platform.",
    stack: ["Docker", "Kubernetes", "AWS"],
    quote:
      "Reliable infrastructure is the foundation of every great product.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Ahmed",
    role: "Backend Engineer",
    image: "/images/team/ahmed.jpg",
    bio:
      "Builds APIs, AI pipelines, and data processing services that transform Reddit discussions into structured insights.",
    stack: ["FastAPI", "PostgreSQL", "Python"],
    quote:
      "Clean architecture creates scalable software.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Mohamed",
    role: "Frontend Engineer",
    image: "/images/team/mohamed.jpg",
    bio:
      "Creates modern, responsive interfaces that deliver a fast and intuitive user experience.",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    quote:
      "Great design makes complex products feel simple.",
    github: "#",
    linkedin: "#",
  },
  {
    name: "Youssef",
    role: "AI Engineer",
    image: "/images/team/youssef.jpg",
    bio:
      "Develops AI-powered features, retrieval pipelines, and intelligent search capabilities that drive product insights.",
    stack: ["Gemini", "RAG", "Python"],
    quote:
      "Artificial intelligence should help people make better decisions.",
    github: "#",
    linkedin: "#",
  },
];

export function TeamSection() {
  return (
    <section
      id="team"
      className="border-b py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Meet the Team
          </span>

          <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl
          bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            The People Behind InsightFlow
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We're a multidisciplinary team of engineers who love building
            products that solve real problems. Every feature is designed,
            developed, and refined with collaboration at its core.
          </p>

        </div>

        {/* Team Grid */}

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {team.map((member) => (
            <Card
              key={member.name}
              className="overflow-hidden rounded-3xl"
            >
              <CardContent className="p-0">

                <Image
                  src={member.image}
                  alt={member.name}
                  width={800}
                  height={600}
                  className="h-80 w-full object-cover"
                />

                <div className="p-8">

                  <h3 className="text-2xl font-bold">
                    {member.name}
                  </h3>

                  <p className="mt-2 font-medium text-primary">
                    {member.role}
                  </p>

                  <p className="mt-6 leading-7 text-muted-foreground">
                    {member.bio}
                  </p>

                  <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-muted-foreground">
                    "{member.quote}"
                  </blockquote>

                  <div className="mt-6 flex flex-wrap gap-2">

                    {member.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border px-3 py-1 text-sm"
                      >
                        {tech}
                      </span>
                    ))}

                  </div>

                  <div className="mt-8 flex gap-4">

                    <Button
                      variant="outline"
                      
                    >
                      <Link href={member.github}>
                        GitHub
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      
                    >
                      <Link href={member.linkedin}>
                        LinkedIn
                      </Link>
                    </Button>

                  </div>

                </div>

              </CardContent>
            </Card>
          ))}

        </div>

      </div>
    </section>
  );
}