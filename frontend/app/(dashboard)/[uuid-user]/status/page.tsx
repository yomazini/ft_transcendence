"use client";

import { ServicesStatus } from "@/components/status/page"
import { useStatus } from "@/hooks/useStatus"




export default function Status() {
  const { services, loading, error } = useStatus();

  if (loading) return <p>Loading services...</p>;
  if (error) return <p>Failed to load services.</p>;

  return (
    <main>
      <ServicesStatus services={services} />
    </main>
  );
}