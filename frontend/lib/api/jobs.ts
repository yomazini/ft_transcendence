import { authHeaders } from "@/lib/auth";

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface JobItem {
	id: string;
	target: string;
	mode: string;
	status: JobStatus;
	org_id: string
	created_at: string;
}

/** GET /api/jobs (nginx -> gateway-svc): the organization's jobs, newest first. */
export async function listJobs(): Promise<JobItem[]> {
	const response = await fetch("/api/jobs", { headers: authHeaders() });
	if (!response.ok) {
		throw new Error(`Could not load jobs (${response.status})`);
	}
	return response.json();
}
