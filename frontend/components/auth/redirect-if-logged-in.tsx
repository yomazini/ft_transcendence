"use client";

import { useEffect } from "react";
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
            WHEN answer = error → do nothing (form stays)
        WHEN page leaves the screen → stillHere ← false

    DRAW nothing
 */

export function RedirectIfLoggedIn() {
	const router = useRouter();

	/* useEffect(fn, [deps]): React runs fn after the component is on screen, and again whenever something in [deps] changes.
	*/
	useEffect(() => {
		if(!getToken()) return ;

		let stillOnPage = true;
		// GET /api/auth/me
		getMe().then((user) => {
			if (stillOnPage) { router.replace(`/${user.id}/dashboard`); }
		}).catch(() => {});
		return () => {
			stillOnPage = false;
		}
	}, [router]);
	return null;
}