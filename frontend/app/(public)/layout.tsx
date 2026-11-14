import type { ReactNode } from "react";
import { FooterSection } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <FooterSection />
    </div>
  );
}