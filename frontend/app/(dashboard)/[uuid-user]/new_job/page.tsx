// import NewJobCard from "@/components/dashboard/home/NewJobCard"
import NewJobCard from "./NewJobCard"
import JobsPanel from "@/components/dashboard/home/JobsPanel"
import SummaryMetrics from "@/components/dashboard/home/SummaryMetrics"

export default function NewJob()
{
	return (
		<main>
			<NewJobCard />

			<JobsPanel />

			<SummaryMetrics />
		</main>
	)
}