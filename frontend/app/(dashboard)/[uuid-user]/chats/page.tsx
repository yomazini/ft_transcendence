"use client"

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Input } from "@/components/ui/input"
import ChatSidebar from "@/components/chats/ChatSidebar"





export default function ChatPage() {
  return (

    <SidebarProvider className="h-full min-h-0">

      <ChatSidebar />

      <SidebarInset className="min-h-0">

        <header className="flex h-14 items-center border-b px-4">
          <SidebarTrigger className="ld:hidden" />

          <div className="ml-3">
            <p className="text-sm font-medium">
              Reddit sentiment analysis
            </p>

            <p className="text-xs text-muted-foreground">
              InsightFlow AI
            </p>
          </div>
        </header>

        <div className="flex flex-1 flex-col bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px]">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl p-6">

              <div className="space-y-6">

                <div className=" p-3 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl border-2 bg-orange-100" >
                  <p className="text-sm">
                    Analyze the latest Reddit posts.
                  </p>
                </div>

                <div>
                  <p className="text-sm leading-7 p-3 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl border-2 bg-white">
                    I've analyzed the available Reddit
                    discussions. The overall sentiment is
                    moderately positive.
                  </p>
                </div>

              </div>

            </div>
          </div>

          <div className="border-t p-4 ">
            <div className="mx-auto max-w-3xl">
                <Input
                  placeholder="Message InsightFlow..."
                  className="rounded-xl  h-15 shadow-none focus-visible:ring-0 bg-white "
                />
            </div>
          </div>

        </div>

      </SidebarInset>

    </SidebarProvider>
  )
}