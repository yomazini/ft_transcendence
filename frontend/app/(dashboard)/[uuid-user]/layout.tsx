import { DashboardNavbar } from "@/components/dashboard/layout/navbar";
import { AppSidebar } from "@/components/dashboard/layout/sidebar";
import FloatingChatWidget from "@/components/message/FloatingChatWidget";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider className="w-full min-w-0 bg-gray-200 p-2 dark:bg-black">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1 border">
          <DashboardNavbar />

          <Toaster position="bottom-right" theme="dark" richColors />

          <main className="w-full min-w-0 max-w-full flex-1 p-3">
            {children}
          </main>
        </SidebarInset>

        <FloatingChatWidget />
      </SidebarProvider>
    </AuthGuard>
  );
}
