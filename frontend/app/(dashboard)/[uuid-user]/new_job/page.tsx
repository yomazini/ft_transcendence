import NewJobCard from "./NewJobCard"
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