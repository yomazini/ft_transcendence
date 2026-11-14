import { JobItem, JobStatus, listJobs } from "@/lib/api/jobs";
import { getToken } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";

type JobEvent = {
	id: string
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
		socket.on("job:update",(data) => {
			client.invalidateQueries({queryKey: ["jobs"]})
		});
		return () => {
			socket.disconnect();
		};
	},[]);

	return {jobs: data, isLoading}

}
