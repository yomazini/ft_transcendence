import { JobItem, JobStatus, listJobs } from "@/lib/api/jobs";
import { getToken } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { notifyUser } from "./submitJob";

type JobEvent = {
	job_id: string
	status: JobStatus
	error?: string
}

export function useJobsLive()
{
	const client = useQueryClient()
	const {data, isLoading, error} = useQuery({queryKey: ["jobs"], queryFn: listJobs})

	useEffect (() => {
		const socket = io({
			transports: ['websocket'],
			path: "/socket.io/",
			auth: {
				token: getToken()
			}
		});
		socket.io.on("reconnect", () => {
			client.invalidateQueries({queryKey: ["jobs"]})
		});
		socket.on("job:update",(event: JobEvent) => {
			const known = client.getQueryData<JobItem[]>(["jobs"])?.some((job) => job.id === event.job_id)
			if (!known) {
				client.invalidateQueries({queryKey: ["jobs"]})
				return
			}
			client.setQueryData(["jobs"], (oldjobs: JobItem[]) => {
				let jobname: string = "uknown"
				const newjobs =  oldjobs.map((job) => {
					if (job.id !== event.job_id) return job
					jobname = job.name
					return {...job, status: event.status}
				})
				if (event.status === "done") notifyUser(`${jobname.length>15 ? jobname.slice(0, 13) + "..." : jobname} is done`, true)
					else if (event.status === "failed") notifyUser(`${jobname.length>15 ? jobname.slice(0, 13) + "..." : jobname} failed reason (${event.error})`, false);
				return newjobs
			})
		});
		return () => {
			socket.disconnect();
		};
	},[client]);

	return {jobs: data, isLoading}

}
