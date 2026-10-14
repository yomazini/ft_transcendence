import { authHeaders } from "@/lib/auth";

export type JobMode = "subreddit" | "keyword" | "post" | "user";

export interface CreatedJob {
	id: string;
	target: string;
	mode: string;
	status: string;
}

/** POST /api/jobs (nginx -> gateway-svc): saves the job and puts it in the scrape queue. */
export async function createJob(mode: JobMode, target: string): Promise<CreatedJob> {
	const response = await fetch("/api/jobs", {
		method: "POST",
		headers: { "Content-Type": "application/json", ...authHeaders() },
		body: JSON.stringify({ mode, target }),
	});
	const data = await response.json().catch(() => null);
	if (!response.ok) {
		const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
		throw new Error(message ?? `Could not create the job (${response.status})`);
	}
	return data as CreatedJob;
}
