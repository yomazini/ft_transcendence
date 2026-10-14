"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./dashboard/layout/theme-toggle";

const links = [
  // {
  //   title: "Features",
  //   href: "#features",
  // },
  // {
  //   title: "Solutions",
  //   href: "#workflow",
  // },
  // {
  //   title: "Pricing",
  //   href: "#pricing",
  // },
  // {
  //   title: "Docs",
  //   href: "#",
  // },
  // {
  //   title: "About",
  //   href: "#",
  // },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            I
          </div>

          <span className="text-lg font-bold">
            InsightFlow
          </span>
        </Link>

        {/* Navigation */}

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Actions */}

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            // 
          >
            <Link href="/login">
              Login
            </Link>
          </Button>

          <Button
            // 
          >
            <Link href="/register">
              Get Started
            </Link>
          </Button>
        </div>

      </div>
    </header>
  );
}