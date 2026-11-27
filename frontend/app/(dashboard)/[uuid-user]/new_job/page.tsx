import NewJobCard from "@/components/new-job/NewJobCard"
import JobsList from "@/components/new-job/JobsList"

export default function NewJob()
{
	return (
		<main className="page-d">
			<NewJobCard />

			<JobsList />
		</main>
	)
}