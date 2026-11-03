
"use client";

import Welcome from "@/components/dashboard/home/welcome";
import NewJobCard from "@/components/dashboard/home/NewJobCard";
import JobsPanel from "@/components/dashboard/home/JobsPanel";
import RevenueOverview from "@/components/dashboard/home/RevenueOverview";
import SummaryMetrics from "@/components/dashboard/home/SummaryMetrics";
import StrategicUsers from "@/components/dashboard/home/StrategicUsers";
import { FactorsCard } from "@/components/dashboard/home/Factors";
import { FeaturesCard } from "@/components/dashboard/home/Features";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { useReportById } from "@/hooks/useReportById";

export default function DashboardPage() {
    const id = useSelectedJobId();
    const { report, loading, error } = useReportById(id);

	return (
		<main className="min-w-0 w-full mx-auto max-w-[1730px] space-y-3 bg-background p-3 text-foreground sm:p-5 lg:p-6 bg-size-[16px_16px]">
			{/* Welcome and key insights */}
			<Welcome />

			{/* Submit a new job */}
			<NewJobCard />

			{/* All jobs with their live status */}
			{/* <JobsPanel /> */}

			{/* Revenue overview and sales distribution */}
			<RevenueOverview report={report}/>

			{/* Summary metrics */}

			{/* <SummaryMetrics /> */}

			{/* Campaigns and products */}
			<StrategicUsers report={report} loading={loading}/>

			<FactorsCard report={report}/>

			<FeaturesCard report={report}/>
		</main>
	);
}
