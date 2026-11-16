import { authHeaders } from "@/lib/auth";
import { notifyUser } from "./submitJob";
import { useMutation } from "@tanstack/react-query";

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
			// onSuccess: () => {
			// 	queryClient.setQueryData(["jobs"],(oldjobs: JobItem[])=> {
			// 		return oldjobs ? oldjobs.filter(job => job.id !== id) : oldjobs
			// 	})
			// },
			onError: () => {
				notifyUser("Something went wrong", false)
			}
		})
	)
}