"use client";

import { DeleteReportById } from "@/lib/api/DeleteRepById";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Report } from "@/app/types/report";

export function useDeleteRepById() {
	// const [ report, setReport ] = useState(null);
	// const [ loadingDelete, setLoading ] = useState(false);
	// const [ errorDelete, setError ] = useState<Error | null>(null);

	// const deleteReport = async ( id : string ) => {
	// 	try {
	// 		setLoading(true);
	// 		setError(null);

	// 		const data = await DeleteReportById(id);
	// 		setReport(data);
	// 	} catch (error) {
	// 		setError(error as Error)
	// 	} finally {
	// 		setLoading(false)
	// 	}
	// }

	// return {
	// 	report,
	// 	loadingDelete,
	// 	errorDelete,
	// 	deleteReport,
	// };
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