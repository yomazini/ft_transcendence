"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getMe, getToken } from "@/lib/auth";

/**
 * @MEHDIJAD/PSEUDOCODE🤖
 * COMPONENT RedirectIfLoggedIn:
    router ← get the page-changer from Next.js

    AFTER the page is on screen (once):
        IF no token stored → STOP (show the form)
        stillHere ← true
        ASK server "who am I?" with the token  (answer comes later)
            WHEN answer = user  → IF stillHere → go to /<user.id>/dashboard (replace history)
            WHEN answer = error → stop checking (form shows)
        WHEN page leaves the screen → stillHere ← false

    DRAW a full-page cover while checking, nothing after
 */

const noSubscribe = () => () => {};

export function RedirectIfLoggedIn() {
	const router = useRouter();
	const hasToken = useSyncExternalStore(noSubscribe, () => !!getToken(), () => null);
	const [tokenRejected, setTokenRejected] = useState(false);

	/* useEffect(fn, [deps]): React runs fn after the component is on screen, and again whenever something in [deps] changes.
	*/
	useEffect(() => {
		if (!hasToken) return;

		let stillOnPage = true;
		// GET /api/auth/me
		getMe().then((user) => {
			if (stillOnPage) { router.replace(`/${user.id}/dashboard`); }
		}).catch(() => {
			if (stillOnPage) { setTokenRejected(true); }
		});
		return () => {
			stillOnPage = false;
		}
	}, [hasToken, router]);

	const checking = hasToken !== false && !tokenRejected;
	return checking ? <div className="fixed inset-0 z-50 bg-background" /> : null;
}