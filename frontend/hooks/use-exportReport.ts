import { exportReport } from "@/lib/api/exportReport";
import { error } from "console";
import { useState } from "react";
import { setLayout } from "recharts/types/state/layoutSlice";

export function useExportReport() {
	const [ expReport, setExpReport ] = useState(null);
	const [ expLoading, setExpLoading ] = useState(false);
	const [ expError, setExpError ] = useState<Error | null>(null);

	const exportRep = async (id: string, format: string) => {
		try {
			setExpLoading(true);
			setExpError(null);

			const data = await exportReport(id, format);
			setExpReport(data);
		} catch (error) {
			setExpError(error as Error)
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