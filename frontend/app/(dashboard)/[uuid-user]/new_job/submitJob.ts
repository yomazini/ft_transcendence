import { JobMode } from "@/lib/api/createJob";
import { JobItem } from "@/lib/api/jobs";
import { authHeaders } from "@/lib/auth";

import { toast } from "sonner";

export function notifyUser(message: string, success: boolean){
	const data =  {description: message, duration: 4000}
	if (success)
		toast.success("Success", data)
	else
		toast.error("Failed", data)
}

export async function submitJob(mode:JobMode, target: string) : Promise<JobItem> {
	const response = await fetch("/api/jobs",
		{
			method: "POST",
			headers: {
				"Content-type": "application/json",
				...authHeaders()
			},
			body: JSON.stringify({"mode": mode, "target": target, "name": target})
		}
	)
	if (!response.ok) {
        throw new Error(`Failed to submit job: ${response.status}`);
    }
	return await response.json();
}