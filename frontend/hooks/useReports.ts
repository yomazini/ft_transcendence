"use client";

import { getReports } from "@/lib/api/organizationReports";
import { useEffect, useState } from "react";

export function useReports() {
	const [reports, setReports] = useState([]);
	const [loading, setloading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		getReports()
			.then((data) => {
				setReports(data);
			})
			.catch((error) => {
				setError(error);
			})
			.finally(() => setloading(false));
	}, []);
	return {
		reports,
		loading,
		error
	};
}