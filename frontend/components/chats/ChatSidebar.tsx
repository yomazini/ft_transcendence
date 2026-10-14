import { MessageSquare, Plus, Search } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


const conversations = [
  "Reddit sentiment analysis",
  "Analyze r/programming",
  "Weekly Reddit report",
  "Marketing opportunities",
  "Competitor analysis",
  "Negative comments analysis",
]

export default function ChatSidebar() {
  return (
    <Sidebar
      collapsible="offcanvas"
      className="relative h-full border-r "
    >
      <SidebarHeader className="p-3">
        <Button className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          New chat
        </Button>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search chats..."
            className="pl-9"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            Conversations
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.map((conversation) => (
                <SidebarMenuItem key={conversation}>
                  <SidebarMenuButton>
                    <MessageSquare className="h-4 w-4" />

                    <span className="truncate">
                      {conversation}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}