"use client";
import {
  ChevronDown,
  LogOut,
} from "lucide-react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./dashboard/layout/theme-toggle";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
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

  const { user, name, initials } = useCurrentUser()
  const router = useRouter()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await logout()
    queryClient.clear() // drop the cached user and reports of this account
    router.replace("/login")
  }

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

          {
            user ? <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="ml-2 flex items-center gap-2 rounded-lg px-1 py-1 text-left hover:bg-muted"
                  />
                }
              >
                <Avatar className="size-9">
                  {/* <AvatarImage src="/avatar.jpg" /> */}

                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden flex-col lg:flex">
                  <span className="text-sm font-medium">
                    {name}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {user?.role}
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
            </DropdownMenu> :
              <>
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/login" />}
                >
                  Login
                </Button>

                <Button
                  nativeButton={false}
                  render={<Link href="/register" />}
                >
                  Get Started
                </Button>

              </>
          }

        </div>

      </div>
    </header>
  );
}