"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  BarChart3,
  Bot,
  CreditCard,
  FileText,
  FolderKanban,
  HelpCircle,
  Home,
  Settings,
  Bell,
} from "lucide-react";

const navigation = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "AI Insights",
    href: "/ai",
    icon: Bot,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

const secondary = [
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 border-r bg-background lg:flex lg:flex-col">

      {/* Logo */}

      <div className="border-b p-6">

        <Link
          href="/dashboard"
          className="text-2xl font-bold tracking-tight"
        >
          InsightFlow
        </Link>

        <p className="mt-1 text-sm text-muted-foreground">
          AI Market Intelligence
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Platform
        </p>

        <div className="space-y-1">

          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />

                {item.title}
              </Link>
            );
          })}

        </div>

        <div className="my-8 border-t" />

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>

        <div className="space-y-1">

          {secondary.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.title}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />

                {item.title}
              </Link>
            );
          })}

        </div>

      </nav>

      {/* User */}

      <div className="border-t p-4">

        <div className="flex items-center gap-3 rounded-2xl border p-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            H
          </div>

          <div className="flex-1">

            <p className="text-sm font-semibold">
              Hamza
            </p>

            <p className="text-xs text-muted-foreground">
              Free Plan
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
}