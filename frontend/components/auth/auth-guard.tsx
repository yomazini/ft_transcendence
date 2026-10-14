"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";

/** Shows the dashboard only to a logged-in user.
 *  No token, an expired or logged-out token (auth-svc answers 401), or another
 *  user's id in the URL: the visitor is sent away before any page is shown. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const urlUserId = useParams<{ "uuid-user": string }>()["uuid-user"];
	const { user, loading, error } = useCurrentUser();

	useEffect(() => {
		if (error) {
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
