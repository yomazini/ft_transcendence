
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createJob, type JobMode } from "@/lib/api/createJob";
import { useJobEvents } from "@/hooks/useJobEvents";

const MODES: { value: JobMode; label: string; placeholder: string }[] = [
	{ value: "subreddit", label: "Subreddit", placeholder: "r/freelance" },
	{ value: "keyword", label: "Keyword", placeholder: "invoicing app" },
	{ value: "post", label: "Post URL", placeholder: "https://www.reddit.com/r/.../comments/..." },
	{ value: "user", label: "User", placeholder: "u/spez" },
];

const STATUS_STYLE: Record<string, string> = {
	queued: "text-muted-foreground",
	running: "text-blue-500",
	done: "text-green-500",
	failed: "text-destructive",
};

/** Submit a new analysis job and follow its status live (WebSocket from gateway-svc). */
export default function NewJobCard() {
	const queryClient = useQueryClient();
	const [mode, setMode] = useState<JobMode>("subreddit");
	const [target, setTarget] = useState<string>("");
	const [jobId, setJobId] = useState<string | undefined>(undefined);
	const [error, setError] = useState<string>("");
	const [submitting, setSubmitting] = useState<boolean>(false);
	const { status, lastError } = useJobEvents(jobId);

	// When the job finishes, refresh the job list in the sidebar and the reports.
	useEffect(() => {
		if (status === "done" || status === "failed") {
			queryClient.invalidateQueries({ queryKey: ["reports"] });
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
		}
	}, [status, queryClient]);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!target.trim()) {
			setError("Enter a target.");
			return;
		}
		setError("");
		setSubmitting(true);
		try {
			const job = await createJob(mode, target.trim());
			setJobId(job.id);
			queryClient.invalidateQueries({ queryKey: ["reports"] });
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setSubmitting(false);
		}
	}

	const shownStatus = jobId ? (status === "idle" ? "queued" : status) : null;
	const placeholder = MODES.find((m) => m.value === mode)?.placeholder;

	return (
		<section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
			<h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
				New analysis job
			</h2>
			<p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
				Pick what to analyze on Reddit. The status updates live while it runs.
			</p>

			<form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleSubmit} noValidate>
				<select
					aria-label="Target type"
					className="h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-800 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100"
					value={mode}
					onChange={(e) => setMode(e.target.value as JobMode)}
					disabled={submitting}
				>
					{MODES.map((m) => (
						<option
							key={m.value}
							value={m.value}
							className="bg-white text-black dark:bg-zinc-900 dark:text-white"
						>
							{m.label}
						</option>
					))}
				</select>

				<Input
					aria-label="Target"
					placeholder={placeholder}
					value={target}
					onChange={(e) => setTarget(e.target.value)}
					disabled={submitting}
					className="h-10 min-w-0 rounded-xl border-zinc-200 bg-zinc-50 px-4 text-sm shadow-none placeholder:text-zinc-400 focus-visible:border-violet-500 focus-visible:ring-violet-500/15 dark:border-white/10 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500 sm:flex-1"
				/>

				<Button
					type="submit"
					disabled={submitting}
					className="h-10 shrink-0 gap-2 rounded-xl bg-violet-600 px-5 font-medium text-white shadow-sm shadow-violet-500/20 transition-all hover:bg-violet-700 hover:shadow-md hover:shadow-violet-500/20 dark:bg-violet-600 dark:hover:bg-violet-500"
				>
					<Send className="size-4" />
					{submitting ? "Sending..." : "Start job"}
				</Button>
			</form>

			{error && (
				<p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
					{error}
				</p>
			)}

			{shownStatus && (
				<p role="status" className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-300">
					Job <span className="font-mono text-xs">{jobId}</span>:{" "}
					<span className={`font-medium ${STATUS_STYLE[shownStatus] ?? ""}`}>{shownStatus}</span>
					{lastError && <span className="text-destructive"> ({lastError})</span>}
				</p>
			)}
		</section>
	);
}
