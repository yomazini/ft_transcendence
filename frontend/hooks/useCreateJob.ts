import { useMutation, useQueryClient } from "@tanstack/react-query";

import { JobMode } from "@/lib/api/createJob";
import { JobItem } from "@/lib/api/jobs";
import { notifyUser } from "@/lib/new-job-utilities";
import { authHeaders } from "@/lib/auth";

interface	CreateJob {
	mode: JobMode,
	target: string,
}

async function submitJob(mode:JobMode, target: string) : Promise<JobItem> {
	const response = await fetch("/api/jobs",
		{
			method: "POST",
			headers: {
				"Content-type": "application/json",
				...authHeaders()
			},
			body: JSON.stringify({"mode": mode, "target": target, "name": target})
		}
	)
	if (!response.ok) {
        throw new Error(`Failed to submit job: ${response.status}`);
    }
	return await response.json();
}

export function useCreateJob () {
	const queryClient = useQueryClient();
	return (
		useMutation({
			mutationFn: ({mode, target} : CreateJob) => submitJob(mode, target),
			onSuccess: (data: JobItem) => {
				queryClient.setQueryData(["jobs"],(oldjobs: JobItem[])=> {
					return oldjobs ? [data, ...oldjobs] : [data]
				})
			},
			onError: () => {
				notifyUser("Something went wrong", false)
			}
		})
	)
}
