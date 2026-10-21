import { DashboardNavbar } from "@/components/dashboard/layout/navbar"
import { AppSidebar } from "@/components/dashboard/layout/sidebar"
import FloatingChatWidget from "@/components/message/FloatingChatWidget";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Toaster } from "sonner";

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <AuthGuard>
      <SidebarProvider className="p-2 bg-gray-200 dark:bg-black">
        <AppSidebar />

        <SidebarInset className="border " >
          <DashboardNavbar />
          <Toaster position="bottom-right" theme="dark" richColors />

          <main className="flex-1 p-3">
            {children}
          </main>
        </SidebarInset>
        <FloatingChatWidget/>
      </SidebarProvider>
    </AuthGuard>
  )
}

