"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe, getToken } from "@/lib/auth"; /* It sends GET /api/auth/me with Authorization: Bearer <token> and returns the User (or throws on 401) */


// This function custom hook is used to get the current logged-in user. It uses react-query to fetch the user data from the server and returns the user object.
export function useCurrentUser() {
	/**
	 * useQuery >  Fetch this, and remember the answer
	 * data = the User (or undefined), isLoading = waiting for the first answer, isError = getMe threw
	 */
	const { data, isLoading, isError } = useQuery({
		queryKey: ["me"],
		queryFn: getMe,
		retry: false,
		enabled: typeof window !== "undefined" && !!getToken() // Only run the query if there is a token && we are in the browser (not during SSR)
	});

	const name = data?.email.split("@")[0] ?? "";
	const initials = name.slice(0, 2).toUpperCase();

	return { user: data ?? null, name, initials, loading: isLoading, error: isError };
}

/** ⚠️@BUG: when we do logged out, useCurrentUser still runs getMe. getMe then sends GET /api/auth/me with no token.
 *  ✅@FIX: only run the query if there is a token.
*/