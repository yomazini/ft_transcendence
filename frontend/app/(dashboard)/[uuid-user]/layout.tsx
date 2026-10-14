import { DashboardNavbar } from "@/components/dashboard/layout/navbar"
import { AppSidebar } from "@/components/dashboard/layout/sidebar"
import FloatingChatWidget from "@/components/message/FloatingChatWidget";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <SidebarProvider className="p-2 bg-gray-200 dark:bg-black">
      <AppSidebar />

      <SidebarInset className="border " >
        <DashboardNavbar />

        <main className="flex-1 p-3">
          {children}
        </main>
      </SidebarInset>
      <FloatingChatWidget/>
    </SidebarProvider>
  )
}

