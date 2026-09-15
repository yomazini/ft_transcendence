import { ReactNode } from "react";

import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/layout/dashboard-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}

      <DashboardSidebar />

      {/* Main */}

      <div className="flex min-h-screen flex-1 flex-col">

        {/* Header */}

        <DashboardHeader />

        {/* Page */}

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}