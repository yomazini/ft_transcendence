"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { saveToken, homePath } from "@/lib/auth";

/** Landing page for the 42 OAuth redirect: /auth/42/done#token=<jwt>.
 *  The backend can't hand the token to frontend code directly after a full-page
 *  redirect, so it arrives in the URL fragment (never sent to any server). */
export default function FortyTwoDonePage() {
	const router = useRouter();

	useEffect(() => {
		const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
		if (!token) {
			router.replace("/login");
			return;
		}
		saveToken(token, true);

		fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
			.then((response) => (response.ok ? response.json() : Promise.reject()))
			.then((user: { id: string }) => router.replace(homePath(user.id)))
			.catch(() => router.replace("/login"));
	}, [router]);

	return <p className="p-8 text-center text-muted-foreground">Signing you in…</p>;
}
