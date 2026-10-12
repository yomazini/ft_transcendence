
"use client";

import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Lightbulb,
  Megaphone,
  Moon,
  MoreHorizontal,
  ShoppingBag,
  ShoppingBasket,
  Users,
  Activity,
  Globe,
  ChartNoAxesCombined,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Welcome from "@/components/dashboard/home/welcome";
import SectionTitle from "@/components/dashboard/home/SectionTitle";
import RevenueOverview from "@/components/dashboard/home/RevenueOverview";
import SummaryMetrics from "@/components/dashboard/home/SummaryMetrics";
import StrategicUsers from "@/components/dashboard/home/StrategicUsers";








export default function DashboardPage({ params }: { params: Promise<{ "uuid-user": string }>}) {
  return (
    <main className="min-w-0 w-full mx-auto max-w-[1730px] space-y-3 bg-background p-3 text-foreground sm:p-5 lg:p-6">
      {/* Welcome and key insights */}
      <Welcome />

      {/* Revenue overview and sales distribution */}
      <RevenueOverview params={params} />

      {/* Summary metrics */}
      
      <SummaryMetrics />

      {/* Campaigns and products */}
      <StrategicUsers params={params}/>
    </main>
  );
}
