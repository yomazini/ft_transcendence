import { CreatedJob, JobMode } from "@/lib/api/createJob";
import { authHeaders } from "@/lib/auth";
import { ok } from "assert";
import { toast } from "sonner";

export function notifyUser(message: string, success: boolean){
	const data =  {description: message, duration: 4000}
	if (success)
		toast.success("Success", data)
	else
		toast.error("Failed", data)
}

export async function submitJob(mode:JobMode, target: string) {
	try {
		const response = await fetch("/api/jobs",
			{
				method: "POST",
				headers: {
					"Content-type": "application/json",
					...authHeaders()
				},
				body: JSON.stringify({"mode": mode, "target": target})
			}
		)
		notifyUser(`${response.statusText} ${response.status}`, response.ok)
	} catch (error) {
		notifyUser("Something went wrong while sendeng the job request", false)
	}
}