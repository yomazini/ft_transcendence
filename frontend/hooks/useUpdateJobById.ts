import { useMutation } from "@tanstack/react-query";

import { authHeaders } from "@/lib/auth";
import { notifyUser } from "../lib/new-job-utilities";

async function updateJob(id: string)
{
	const response = await fetch(`/api/jobs/requeue`,
		{
			method: "POST",
			headers: {
				"Content-type": "application/json",
				...authHeaders()
			},
			body: JSON.stringify({id: id})
		}
	)
	if (!response.ok) {
		throw new Error(`Failed to delete job: ${response.status}`);
	}
}

export function useUpdateJobById()
{
	// const queryClient = useQueryClient();
	return (
		useMutation({
			mutationFn: (id : string) => updateJob(id),
			onError: () => {
				notifyUser("Something went wrong", false)
			}
		})
	)
}
