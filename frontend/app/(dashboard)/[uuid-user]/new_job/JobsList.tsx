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
				<h1>There is no report</h1>
			</div>
		)
	}
	return (
		<section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-3">
			<div>
				<h1>Jobs</h1>
			</div>
			<div>
				{
					loading ?
					<p>Loading jobs...</p> :
					jobs.map((job) => (
						<JobCard key={job.id} jobs={job} />
					))
				}
			</div>
		</section>
	)
}