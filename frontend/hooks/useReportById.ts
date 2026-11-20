"use client";

import { useQuery } from "@tanstack/react-query";

import { getReportById } from "@/lib/api/getReportById";

export function useReportById(uuid: string | null) {
	const { data, isLoading, error } = useQuery({
		queryKey: ["report", uuid],
		queryFn: () => getReportById(uuid as string),
		enabled: !!uuid,
		retry: false,
	});

	return { report: data ?? null, loading: !!uuid && isLoading, error: error as Error | null };
}
