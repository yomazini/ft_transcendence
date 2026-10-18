
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
import NewJobCard from "@/components/dashboard/home/NewJobCard";
import JobsPanel from "@/components/dashboard/home/JobsPanel";
import SectionTitle from "@/components/dashboard/home/SectionTitle";
import RevenueOverview from "@/components/dashboard/home/RevenueOverview";
import SummaryMetrics from "@/components/dashboard/home/SummaryMetrics";
import StrategicUsers from "@/components/dashboard/home/StrategicUsers";
import ListUesrs from "@/components/dashboard/home/listUsers";








export default function DashboardPage() {
	return (
		<main className="min-w-0 w-full mx-auto max-w-[1730px] space-y-3 bg-background p-3 text-foreground sm:p-5 lg:p-6">
			{/* Welcome and key insights */}
			<Welcome />

			{/* Submit a new job */}
			<NewJobCard />

			{/* All jobs with their live status */}
			<JobsPanel />

			{/* Revenue overview and sales distribution */}
			<RevenueOverview />

			{/* Summary metrics */}

			<SummaryMetrics />

			{/* Campaigns and products */}
			<StrategicUsers />

			<ListUesrs />
		</main>
	);
}
