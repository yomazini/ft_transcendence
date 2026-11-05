import { authHeaders } from "@/lib/auth";
import { notifyUser } from "./submitJob";

export async function deleteJob(id: string)
{
	try {
		const response = await fetch(`/api/jobs/${id}`,
			{
				method: "DELETE",
				headers: {
					"Content-type": "application/json",
					...authHeaders()
				}
			}
		)
		if (response.ok)
			notifyUser("Job deleted successfully", response.ok)
		else
			notifyUser(`${response.statusText} ${response.status}`, response.ok)
	} catch (error) {
		notifyUser(`Failed to delete job: ${id}`, false)
	}
}