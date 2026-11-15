"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { clearToken, getToken, getTokenExp } from "@/lib/auth";

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

	useEffect(() => {
		if (!user) return;
		const exp = getTokenExp();
		if (!exp) return;
		const logout = () => {
			clearToken();
			queryClient.clear();
			router.replace("/login");
		};
		const delay = exp * 1000 - Date.now();
		if (delay <= 0) {
			logout();
			return;
		}
		const timer = setTimeout(logout, delay);
		return () => clearTimeout(timer);
	}, [user, queryClient, router]);

	if (loading || error || !user || user.id !== urlUserId) {
		return null;
	}
	return <>{children}</>;
}
