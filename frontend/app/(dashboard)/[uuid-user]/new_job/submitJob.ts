import { CreatedJob, JobMode } from "@/lib/api/createJob";

export async function name(mode:JobMode, target: string) : Promise<boolean> {
	const response = await fetch("/api/jobs",
		{
			method: "POST",
			headers: {
				"Content-type": "application/json"
			},
			body: JSON.stringify({"mode": mode, "target": target})
		}
	)
	// const data = await response.json().catch(() => null)
	return response.ok
}