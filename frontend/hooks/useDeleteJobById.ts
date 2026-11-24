import { authHeaders } from "@/lib/auth";
import { notifyUser } from "@/lib/new-job-utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JobItem } from "@/lib/api/jobs";

async function deleteJob(id: string)
{
	const response = await fetch(`/api/jobs/${id}`,
		{
			method: "DELETE",
			headers: {
				"Content-type": "application/json",
				...authHeaders()
			}
		}
	)
	if (!response.ok) {
		throw new Error(`Failed to delete job: ${response.status}`);
	}
	return id
}

export function useDeleteJobById()
{
	const queryClient = useQueryClient();
	return (
		useMutation({
			mutationFn: (id : string) => deleteJob(id),
			onSuccess: (id :string ) => {
				queryClient.setQueryData(["jobs"],(oldjobs: JobItem[])=> {
					return oldjobs ? oldjobs.filter(job => job.id !== id) : oldjobs
				})
			},
			onError: () => {
				notifyUser("Something went wrong", false)
			}
		})
	)
}
