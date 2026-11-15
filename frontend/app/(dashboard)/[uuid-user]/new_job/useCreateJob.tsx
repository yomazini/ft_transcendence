import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyUser, submitJob } from "./submitJob";
import { JobMode } from "@/lib/api/createJob";
import { JobItem } from "@/lib/api/jobs";

interface	CreateJob {
	mode: JobMode,
	target: string,
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