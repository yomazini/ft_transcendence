
"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobs, Job } from "./getJobs";
import { JobCard } from "./JobCard";
import { useEffect, useState } from "react";
import { listJobs } from "@/lib/api/jobs";
// import { CheckCircle, Clock, LoaderCircle, LoaderIcon, XCircle } from "lucide-react";

// const JOBSUMMERIES = {""}

export default function JobsList() {
	// const [loading, setLoading] = useState(true)
	// const [jobs, setJobs] = useState<Job[]>([])
	const { data: jobs = [], isLoading: loading, error } = useQuery({ queryKey: ["jobs"], queryFn: listJobs });

	// useEffect(() => {
	// 	getJobs().then((data) => {
	// 		setJobs(data)
	// 		setLoading(false)
	// 	})
	// }, [])
	if (jobs.length === 0) {
		return (
			<div>
				<h1 className="text-zinc-700 dark:text-zinc-200">There is no report</h1>
			</div>
		)
	}
	return (
		<section className="mx-auto flex w-full flex-col gap-5 px-4 py-3">
			<div>
				<h1 className="text-zinc-900 dark:text-zinc-100">Jobs</h1>
			</div>
			<div>
				{
					loading ?
					<p className="text-zinc-600 dark:text-zinc-300">Loading jobs...</p> :
					jobs.map((job) => (
						<JobCard key={job.id} jobs={job} />
					))
				}
			</div>
		</section>
	)
}
