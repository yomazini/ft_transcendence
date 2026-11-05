"use client";

import { getJobs, Job } from "./getJobs";
import { JobCard } from "./JobCard";
import { useEffect, useState } from "react";
// import { CheckCircle, Clock, LoaderCircle, LoaderIcon, XCircle } from "lucide-react";

// const JOBSUMMERIES = {""}

export default function JobsList() {
	const [loading, setLoading] = useState(true)
	const [jobs, setJobs] = useState<Job[]>([])

	useEffect(() => {
		getJobs().then((data) => {
			setJobs(data)
			setLoading(false)
		})
	}, [])

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
						<JobCard key={job.id} {...job} />
					))
				}
			</div>
		</section>
	)
}