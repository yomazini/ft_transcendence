import { authHeaders } from "@/lib/auth";
import { notifyUser } from "./submitJob";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JobItem } from "@/lib/api/jobs";

interface updateJobNameParams {
	id: string,
	name: string
}

async function updateJobName(id: string, name:string): Promise<updateJobNameParams>
{
	const response = await fetch(`/api/jobs/${id}`,
		{
			method: "PUT",
			headers: {
				"Content-type": "application/json",
				...authHeaders()
			},
			body: JSON.stringify({name: name})
		}
	)
	if (!response.ok) {
		throw new Error(`Failed to change job name: ${response.status}`);
	}
	return {id, name}
}

export function useUpdateJobNameById()
{
	const queryClient = useQueryClient();
	return (
		useMutation({
			mutationFn: ({id , name}: updateJobNameParams) => updateJobName(id, name),
			onSuccess: ({id , name}: updateJobNameParams) => {
				queryClient.setQueryData(["jobs"],(oldjobs: JobItem[] | undefined) => {
					if (oldjobs === undefined) return oldjobs
				
					return oldjobs.map((job) => {
						if (job.id !== id) return job
						return {...job, name: name}
					})
				})
			},
			onError: () => {
				notifyUser("Something went wrong", false)
			}
		})
	)
}