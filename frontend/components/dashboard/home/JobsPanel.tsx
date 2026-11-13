
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useJobsLive } from "@/hooks/useJobsLive";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import type { JobStatus } from "@/lib/api/jobs";

const STATUS_STYLE: Record<JobStatus, string> = {
	queued: "bg-muted text-muted-foreground",
	scraping: "bg-blue-500/15 text-orange-500",
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
		<section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
					Jobs
				</h2>
				<span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
					live
				</span>
			</div>

			{loading ? (
				<p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
					Loading jobs...
				</p>
			) : error ? (
				<p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
					{error.message}
				</p>
			) : jobs.length === 0 ? (
				<p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
					No jobs yet. Start one above.
				</p>
			) : (
				<ul className="mt-4 divide-y divide-zinc-100 dark:divide-white/10">
					{jobs.map((job) => (
						<li key={job.id}>
							<Link
								href={`/${userId}/dashboard?job=${job.id}`}
								className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors hover:bg-violet-50/70 dark:hover:bg-violet-500/10 ${
									selected === job.id
										? "bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:ring-violet-500/20"
										: ""
								}`}
							>
								<span
									className={`w-20 shrink-0 rounded-lg px-2 py-1 text-center text-xs font-medium ${STATUS_STYLE[job.status] ?? ""}`}
								>
									{job.status}
								</span>

								<span className="w-20 shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
									{job.mode}
								</span>

								<span className="min-w-0 flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
									{job.target}
								</span>

								<span className="hidden shrink-0 text-xs text-zinc-400 dark:text-zinc-500 sm:inline">
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
