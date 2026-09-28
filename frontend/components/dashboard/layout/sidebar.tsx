import Link from "next/link"
import {
  BarChart3,
  ShoppingCart,
  House,
  Sparkles,
  GraduationCap,
  CreditCard,
  HeartPulse,
  Settings,
  Users,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const dashboardItems = [
  {
    title: "Home",
    url: "/33/dashboard",
    icon: House,
  },
  {
    title: "Management",
    url: "/33/management",
    icon: ShoppingCart,
  },
  {
    title: "Chats",
    url: "/33/chats",
    icon: Sparkles,
  },
  {
    title: "Billing",
    url: "/33/billing",
    icon: CreditCard,
  },
  {
    title: "Setting",
    url: "/33/setting",
    icon: Settings,
  },
]

const appItems = [
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
  },
]

export function AppSidebar() {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border bg-white"
    >
      {/* Logo */}
      <SidebarHeader className="border-b">
        <div className="flex h-14 items-center gap-3 px-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black text-white">
            <span className="text-lg font-bold">I</span>
          </div>

          <div className="flex flex-1 flex-col">
            <span className="text-sm font-semibold">
              InsightFlow
            </span>

            <span className="text-[11px] text-muted-foreground">
              Dashboard
            </span>
          </div>

          <span className="rounded border px-1.5 py-0.5 text-[10px] font-medium">
            V1.0
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarGroupLabel>
            DASHBOARD
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton  tooltip={item.title}>
                    <Link href={item.url} className="flex space-x-3">
                      <item.icon />
                      <span className="font-bold ">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Apps */}
        {/* <SidebarGroup>
          <SidebarGroupLabel>
            APPS
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {appItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton  tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>*/}
      </SidebarContent> 

      {/* Footer */}
      {/* <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton  tooltip="Settings">
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  )
}