import NewJobCard from "./NewJobCard"
import JobsList from "./JobsList"
import { useUserRole } from "./useUserRole"
import { Role } from "@/lib/auth"

export default function NewJob()
{
	return (
		<main className="page-d">
			<NewJobCard />

			<JobsList />
		</main>
	)
}