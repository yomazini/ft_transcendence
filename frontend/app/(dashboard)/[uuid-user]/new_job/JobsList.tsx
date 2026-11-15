
"use client";

import { useQuery } from "@tanstack/react-query";
import { JobCard } from "./JobCard";
import { useEffect, useState } from "react";
import { listJobs } from "@/lib/api/jobs";
import { useJobsLive } from "./useJobsLive";
import { useUserRole } from "./useUserRole";
// import { CheckCircle, Clock, LoaderCircle, LoaderIcon, XCircle } from "lucide-react";

// const JOBSUMMERIES = {""}

export default function JobsList() {
	const { jobs = [], isLoading: loading } = useJobsLive();
	const role = useUserRole()

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
						<JobCard key={job.id} role={role} jobs={job} />
					))
				}
			</div>
		</section>
	)
}
