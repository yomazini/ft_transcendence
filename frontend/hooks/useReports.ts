"use client";

import { getReports } from "@/lib/api/organizationReports";
import { useQuery } from "@tanstack/react-query";

export function useReports() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["reports"],
		queryFn: getReports,
	});

	return { reports: data ?? [], loading: isLoading, error };
}