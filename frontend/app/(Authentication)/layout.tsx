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
    <div className="">
        {children}
    </div>
  )
}