
"use client";

import Welcome from "@/components/dashboard/home/welcome";
import RevenueOverview from "@/components/dashboard/home/RevenueOverview";
import SummaryMetrics from "@/components/dashboard/home/SummaryMetrics";
import { FactorsCard } from "@/components/dashboard/home/Factors";
import { FeaturesCard } from "@/components/dashboard/home/Features";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { useReportById } from "@/hooks/useReportById";
import Strategic from "@/components/dashboard/home/Strategic";

export default function DashboardPage() {
	const id = useSelectedJobId();
	const { report, loading, error } = useReportById(id);

	return (
		<main className="page-d">
			<Welcome />

			<SummaryMetrics />

			{/* <NewJobCard /> */}

			{/* <JobsPanel /> */}

			<RevenueOverview report={report} />

			<Strategic report={report} loading={loading}/>

			<FactorsCard report={report} />

			<FeaturesCard report={report} />
		</main>
	);
}
