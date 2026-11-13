import { JobMode } from "@/lib/api/createJob"
import { JobStatus } from "@/lib/api/jobs"
import { authHeaders } from "@/lib/auth"

//im not still using this type im using interface in useJobsLive !!!
export type Job = {
	job_id: string
	org_id: string
	target: string
	mode: JobMode
	status: JobStatus
	created_at: string
}

export const STATUS_STYLE: Record<JobStatus, string> = {
    queued: "bg-muted text-muted-foreground",
    running: "bg-blue-500/15 text-blue-500",
    scraping: "bg-blue-500/15 text-orange-500",
    done: "bg-green-500/15 text-green-500",
    failed: "bg-destructive/15 text-destructive",
};

export async function getJobs(): Promise<Job[]> {
	try {
		const response = await fetch(`/api/jobs/`, {
			method: "GET",
			headers: {
				"Content-type": "application/json",
				...authHeaders()
			}
		})
		const data = await response.json().catch(() => null)
		if (!response.ok)
			throw new Error(`can't get organization jobs reason ${response.statusText}`)
		return (data as Job[])
	} catch (error) {
		console.log(error)
		return []
	}
}
