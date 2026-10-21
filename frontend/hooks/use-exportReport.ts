import { exportReport } from "@/lib/api/exportReport";
import { useState } from "react";

export function useExportReport() {
	const [ expReport, setExpReport ] = useState<Blob | null>(null);
	const [ expLoading, setExpLoading ] = useState(false);
	const [ expError, setExpError ] = useState<Error | null>(null);

	const exportRep = async (id: string | null, format: string) => {
		try {
			setExpLoading(true);
			setExpError(null);

			const data = await exportReport(id, format);
			setExpReport(data);
		} catch (error) {
			setExpError(error as Error)
			throw error
		} finally {
			setExpLoading(false);
		}
	}

	return {
		expReport,
		expLoading,
		expError,
		exportRep,
	}
}
