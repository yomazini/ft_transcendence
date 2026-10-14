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

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="hidden h-6 w-px bg-border sm:block" />

        {/* Search */}
        <div className="relative hidden w-80 md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search..."
            className="h-9 pl-9"
          />
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-1">
        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Search />
        </Button>

        {/* Theme */}
        {/* <Button
          variant="ghost"
          size="icon"
        >
          <Moon />
        
        </Button> */}
        
        <ThemeToggle/>
        

        {/* User */}
        <div className="ml-2 flex items-center gap-2">
          <Avatar className="size-9">
            <AvatarImage src="/avatar.jpg" />

            <AvatarFallback>
              HK
            </AvatarFallback>
          </Avatar>

          <div className="hidden flex-col lg:flex">
            <span className="text-sm font-medium">
              Hamza
            </span>

            <span className="text-xs text-muted-foreground">
              Admin
            </span>
          </div>

          <ChevronDown className="hidden size-4 text-muted-foreground lg:block" />
        </div>
      </div>
    </header>
  )
}