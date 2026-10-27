"use client";

import { getStatus } from "@/lib/api/getstatus";
import { useQuery } from "@tanstack/react-query";

export function useStatus() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["status"],
		queryFn: getStatus,
	});

	return { services: data ?? [], loading: isLoading, error };
}