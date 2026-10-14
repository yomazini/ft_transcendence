"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/lib/auth";

/** The logged-in user (email, role, org) from GET /api/auth/me. */
export function useCurrentUser() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ["me"],
		queryFn: getMe,
		retry: false,
	});

	// There is no display name in the account yet: use the part of the email before "@".
	const name = data?.email.split("@")[0] ?? "";
	const initials = name.slice(0, 2).toUpperCase();

	return { user: data ?? null, name, initials, loading: isLoading, error: isError };
}
