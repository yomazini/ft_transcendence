"use client"

import {
  Bell,
  ChevronDown,
  Mail,
  Moon,
  Search,
  ShoppingCart,
  Sun,
} from "lucide-react"

import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardNavbar() {
  const { user, name, initials } = useCurrentUser()
  const router = useRouter()
  const queryClient = useQueryClient()

  async function handleLogout() {
    await logout()
    queryClient.clear() // drop the cached user and reports of this account
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="hidden h-6 w-px bg-border sm:block" />

        {/* Search */}
        
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-1">
        {/* Mobile search */}
        

        {/* Theme */}
        {/* <Button
          variant="ghost"
          size="icon"
        >
          <Moon />
        
        </Button> */}
        
        <ThemeToggle/>
        

        {/* User */}
        <DropdownMenu>
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
        </DropdownMenu>
      </div>
    </header>
  )
}