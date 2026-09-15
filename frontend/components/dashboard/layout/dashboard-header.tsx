"use client";

import { Bell, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">

      <div className="flex h-16 items-center justify-between px-6">

        {/* Left */}

        <div>

          <h1 className="text-2xl font-bold">
            Dashboard
          </h1>

          <p className="text-sm text-muted-foreground">
            Welcome back! Here's what's happening today.
          </p>

        </div>

        {/* Right */}

        <div className="flex items-center gap-4">

          {/* Search */}

          <div className="relative hidden lg:block">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search..."
              className="w-72 pl-10"
            />

          </div>

          {/* Notifications */}

          <Button
            variant="ghost"
            size="icon"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Avatar */}

          <Button
            variant="ghost"
            className="h-auto gap-3 px-2 py-1"
          >

            <Avatar className="h-9 w-9">

              <AvatarFallback>
                H
              </AvatarFallback>

            </Avatar>

            <div className="hidden text-left lg:block">

              <p className="text-sm font-semibold">
                Hamza
              </p>

              <p className="text-xs text-muted-foreground">
                Free Plan
              </p>

            </div>

          </Button>

        </div>

      </div>

    </header>
  );
}