import NewJobCard from "./NewJobCard"
import SummaryMetrics from "@/components/dashboard/home/SummaryMetrics"
import JobsList from "./JobsList"

export default function NewJob()
{
	return (
		<main className="page-d">
			<NewJobCard />

			<JobsList />
		</main>
	)
}