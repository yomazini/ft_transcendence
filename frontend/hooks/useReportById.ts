"use client";

import { useQuery } from "@tanstack/react-query";

import { getReportById } from "@/lib/api/getReportById";

/** The report of one job (reporting-svc). Does nothing while no job is selected. */
export function useReportById(id: string | null) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["report", id],
		queryFn: () => getReportById(id as string),
		enabled: !!id,
		retry: false,
	});

	return { report: data ?? null, loading: !!id && isLoading, error: error as Error | null };
}
