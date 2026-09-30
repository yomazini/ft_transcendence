"use client";

import { DeleteReportById } from "@/lib/api/DeleteRepById";
import { useEffect, useState } from "react";

export function useDeleteRepById() {
	const [ report, setReport ] = useState(null);
	const [ loadingDelete, setLoading ] = useState(false);
	const [ errorDelete, setError ] = useState<Error | null>(null);

	const deleteReport = async ( id : string ) => {
		try {
			setLoading(true);
			setError(null);

			const data = await DeleteReportById(id);
			setReport(data);
		} catch (error) {
			setError(error as Error)
		} finally {
			setLoading(false)
		}
	}

	return {
		report,
		loadingDelete,
		errorDelete,
		deleteReport,
	};
}