"use client";

import { DeleteReportById } from "@/lib/api/DeleteRepById";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Report } from "@/app/types/report";

export function useDeleteRepById() {
	const queryClient = useQueryClient();
	const onMutate = async (id : string) => {
		await queryClient.cancelQueries({ queryKey: ["reports"] });

		const previous = queryClient.getQueryData<Report[]>(["reports"]);

		queryClient.setQueryData<Report[]>(["reports"], (old = []) =>
			old.filter((r) => r.id !== id)
		);
		return { previous };
	}
	const onError = (
		_err: Error,
		_id: string,
		context?: { previous?: Report[] },
	) => {
		queryClient.invalidateQueries({ queryKey: ["reports"]});
	}

	const onSettled = () => {
		queryClient.invalidateQueries({ queryKey: ["reports"]});
		queryClient.invalidateQueries({ queryKey: ["jobs"]});
	}

	const mutation = useMutation({
		mutationFn: DeleteReportById,
		onMutate,
		onError,
		onSettled,
	});

	return mutation;
}