"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getMe, type User } from "@/lib/auth";
import BillingPage from "@/components/billing/billing";

export default function Billing() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const currentUser = await getMe();

        if (!active) return;

        if (currentUser.role !== "Admin") {
          router.replace("/dashboard");
          return;
        }

        if (!currentUser.org_id) {
          setError("No organization found.");
          return;
        }

        setUser(currentUser);
      } catch {
        if (active) {
          setError("Unable to verify your permissions.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading || (!user && !error)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }
  
  if (!user || !user.org_id) {
    return null;
  }

  return (
    <BillingPage
    orgId={user.org_id}
    role={user.role}
  />
  )
}


