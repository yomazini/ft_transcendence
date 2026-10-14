"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useJobsLive } from "@/hooks/useJobsLive";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import type { JobStatus } from "@/lib/api/jobs";

const STATUS_STYLE: Record<JobStatus, string> = {
	queued: "bg-muted text-muted-foreground",
	running: "bg-blue-500/15 text-blue-500",
	done: "bg-green-500/15 text-green-500",
	failed: "bg-destructive/15 text-destructive",
};

/** All jobs of the organization with their live status (queued, running, done, failed). */
export default function JobsPanel() {
	const { jobs, loading, error } = useJobsLive();
	const userId = useParams<{ "uuid-user": string }>()["uuid-user"];
	const selected = useSelectedJobId();

	return (
		<section className="min-w-0 border p-5 sm:p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold">Jobs</h2>
				<span className="text-xs text-muted-foreground">live</span>
			</div>

			{loading ? (
				<p className="mt-3 text-sm text-muted-foreground">Loading jobs...</p>
			) : error ? (
				<p className="mt-3 text-sm text-destructive">{error.message}</p>
			) : jobs.length === 0 ? (
				<p className="mt-3 text-sm text-muted-foreground">No jobs yet. Start one above.</p>
			) : (
				<ul className="mt-3 divide-y">
					{jobs.map((job) => (
						<li key={job.id}>
							<Link
								href={`/${userId}/dashboard?job=${job.id}`}
								className={`flex items-center gap-3 rounded px-1 py-2 text-sm hover:bg-muted ${selected === job.id ? "bg-muted" : ""}`}
							>
							<span
								className={`w-20 shrink-0 rounded px-2 py-0.5 text-center text-xs font-medium ${STATUS_STYLE[job.status] ?? ""}`}
							>
								{job.status}
							</span>
							<span className="w-20 shrink-0 text-xs text-muted-foreground">{job.mode}</span>
							<span className="min-w-0 flex-1 truncate">{job.target}</span>
							<span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
								{new Date(job.created_at).toLocaleString()}
							</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
