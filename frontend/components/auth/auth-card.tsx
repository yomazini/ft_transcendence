import { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({
  children,
  className,
}: AuthCardProps) {
  return (
    <Card
      className={`w-full max-w-md rounded-3xl border shadow-xl ${className ?? ""}`}
    >
      <CardContent className="p-8 md:p-10">
        {children}
      </CardContent>
    </Card>
  );
}