import { ReportDetails } from "@/app/types/report";
import { getReportById } from "@/lib/api/getReportById";
import { useEffect, useState } from "react";




export function useReportById(id: string) {
	const [report, setReport] = useState<ReportDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		getReportById(id)
			.then((data) => {
				setReport(data);
			})
			.catch((error) => {
				setError(error);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [id]);

	return {
		report,
		loading,
		error
	};
}