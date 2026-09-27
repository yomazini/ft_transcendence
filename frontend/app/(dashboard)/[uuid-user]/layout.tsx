import { DashboardNavbar } from "@/components/dashboard/layout/navbar"
import { AppSidebar } from "@/components/dashboard/layout/sidebar"
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
    <SidebarProvider className="p-2 bg-gray-200">
      <AppSidebar  />

      <SidebarInset className="border " >
        <DashboardNavbar />

        <main className="flex-1 p-3">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}