
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { JobCard } from "./JobCard";
import { listJobs } from "@/lib/api/jobs";
import { useUserRole } from "@/hooks/useUserRole";
import { notifyUser } from "@/lib/new-job-utilities";

export default function JobsList() {
	const {data: jobs = [], isLoading, error} = useQuery({queryKey: ["jobs"], queryFn: listJobs, retry: false})
	const userId = useParams<{'uuid-user': string}>()['uuid-user']
	const role = useUserRole()

	if (error)
		notifyUser(error.message, false)

	return (
		<section className="mx-auto flex w-full flex-col gap-5 px-4 py-3">
			<div>
				<h1 className="text-zinc-900 dark:text-zinc-100">Jobs</h1>
			</div>
			{
				jobs.length === 0 ? (
					<div>
						<h1 className="text-zinc-700 dark:text-zinc-200">There is no report</h1>
					</div>
				) : (
				<div className="flex w-full flex-col gap-5 px-4 py-3">
					{
						isLoading ?
						<p className="text-zinc-600 dark:text-zinc-300">Loading jobs...</p> :
						jobs.map((job) => (
							<JobCard key={job.id} userId={userId} role={role} jobs={job} />
						))
					}
				</div>)
			}
			
		</section>
	)
}
