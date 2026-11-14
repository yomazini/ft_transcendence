"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken, getToken } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const urlUserId = useParams<{ "uuid-user": string }>()["uuid-user"];
	const { user, loading, error } = useCurrentUser();

	useEffect(() => {
		if (error || !getToken()) { // no token: go to /login without asking /me
			clearToken();
			queryClient.clear();
			router.replace("/login");
		} else if (user && user.id !== urlUserId) {
			router.replace(`/${user.id}/dashboard`);
		}
	}, [error, user, urlUserId, router]);

	if (loading || error || !user || user.id !== urlUserId) {
		return null;
	}
	return <>{children}</>;
}
