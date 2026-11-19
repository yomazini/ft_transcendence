"use client";

import { useQuery } from "@tanstack/react-query";

import { getMembers } from "@/lib/api/members";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Members of the logged-in user's organization. */
export function useMembers() {
	const { user } = useCurrentUser();
	const orgId = user?.org_id;
	const { data, isLoading, error } = useQuery({
		queryKey: ["members", orgId],
		queryFn: () => getMembers(orgId as string),
		enabled: !!orgId,
		retry: false
	});
	return { members: data ?? [], loading: isLoading, error: error as Error | null, orgId, me: user };
}
