"use client";

import { ChevronDown, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./dashboard/layout/theme-toggle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/auth";

const links = [
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Contact",
    href: "/contact",
  },
  {
    title: "Dashboard",
    href: "/login",
  },
];

export function Navbar() {
  const { user, name, initials } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await logout();
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">

        {/* Logo */}

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            I
          </div>

          <span className="text-base font-bold sm:text-lg">
            InsightFlow
          </span>
        </Link>

        {/* Desktop Navigation */}

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

        <div className="flex items-center gap-1 sm:gap-3">
          <ThemeToggle />

          {/* User Menu */}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-muted"
                  />
                }
              >
                <Avatar className="size-9">
                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden flex-col lg:flex">
                  <span className="text-sm font-medium">
                    {name}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {user.role}
                  </span>
                </div>

                <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Desktop Authentication Buttons */}

              <Button
                className="hidden md:inline-flex"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Login
              </Button>

              <Button
                className="hidden md:inline-flex"
                nativeButton={false}
                render={<Link href="/register" />}
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile Navigation */}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Menu className="size-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {links.map((link) => (
                <DropdownMenuItem
                  key={link.title}
                  render={<Link href={link.href} />}
                >
                  {link.title}
                </DropdownMenuItem>
              ))}

              {!user && (
                <>
                  <DropdownMenuItem
                    render={<Link href="/login" />}
                  >
                    Login
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    render={<Link href="/register" />}
                  >
                    Get Started
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
