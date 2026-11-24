import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";

import { JobItem, JobStatus, listJobs } from "@/lib/api/jobs";
import { getToken } from "@/lib/auth";
import { notifyUser } from "@/lib/new-job-utilities"; 

type JobEvent = {
	job_id: string
	status: JobStatus
	error?: string
}

export function useJobsLive()
{
	const client = useQueryClient()
	const {data, isLoading, error} = useQuery({queryKey: ["jobs"], queryFn: listJobs, retry: false})

	useEffect (() => {
		const socket = io({
			transports: ['websocket'],
			path: "/socket.io/",
			auth: {
				token: getToken()
			}
		});
		socket.io.on("reconnect", () => {
			client.invalidateQueries({queryKey: ["jobs"]});
			client.invalidateQueries({queryKey:["report"]});
		});
		socket.on("job:update",(event: JobEvent) => {
			const known = client.getQueryData<JobItem[]>(["jobs"])?.some((job) => job.id === event.job_id)
			if (!known) {
				client.invalidateQueries({queryKey: ["jobs"]})
				client.invalidateQueries({queryKey:["report"]})
				return
			}
			client.setQueryData(["jobs"], (oldjobs: JobItem[] | undefined) => {
				if (oldjobs === undefined) return
				
				let jobname: string = "uknown"
				const newjobs =  oldjobs.map((job) => {
					if (job.id !== event.job_id) return job
					jobname = job.name
					return {...job, status: event.status}
				})
				if (["done", "failed"].includes(event.status)) client.invalidateQueries({queryKey:["report", event.job_id]})
				if (event.status === "done") notifyUser(`${jobname.length>10 ? jobname.slice(0, 7) + "..." : jobname} is done`, true);
				else if (event.status === "failed") notifyUser(`${jobname.length>10 ? jobname.slice(0, 7) + "..." : jobname} failed reason (${event.error})`, false);
				return newjobs
			})
		});
		return () => {
			socket.disconnect();
		};
	},[client]);

	return { jobs: data ?? [], loading: isLoading, error }
}
