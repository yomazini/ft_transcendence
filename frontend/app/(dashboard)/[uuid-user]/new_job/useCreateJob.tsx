import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitJob } from "./submitJob";
import { JobMode } from "@/lib/api/createJob";

interface	CreateJob {
	mode: JobMode,
	target: string,
}

export function useCreateJob () {
	const queryClient = useQueryClient();
	return (
		useMutation({
			mutationFn: ({mode, target} : CreateJob) => {
				return submitJob(mode, target)
			},
			onSuccess: async () => {
				await queryClient.invalidateQueries(
					{
						queryKey: ["jobs"]
					}
				)
			}
		})
	)
}