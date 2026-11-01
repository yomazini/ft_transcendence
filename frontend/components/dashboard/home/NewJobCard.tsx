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
		<section className="min-w-0 border p-5 sm:p-6 bg-card">
			<h2 className="text-base font-semibold">New analysis job</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Pick what to analyze on Reddit. The status updates live while it runs.
			</p>

			<form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
				<select
					aria-label="Target type"
					className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
					value={mode}
					onChange={(e) => setMode(e.target.value as JobMode)}
					disabled={submitting}
				>
					{MODES.map((m) => (
						<option key={m.value} value={m.value}>
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
					className="sm:flex-1"
				/>

				<Button type="submit" disabled={submitting}>
					<Send className="size-4" />
					{submitting ? "Sending..." : "Start job"}
				</Button>
			</form>

			{error && (
				<p role="alert" className="mt-3 text-sm text-destructive">
					{error}
				</p>
			)}

			{shownStatus && (
				<p role="status" className="mt-3 text-sm">
					Job <span className="font-mono text-xs">{jobId}</span>:{" "}
					<span className={`font-medium ${STATUS_STYLE[shownStatus] ?? ""}`}>{shownStatus}</span>
					{lastError && <span className="text-destructive"> ({lastError})</span>}
				</p>
			)}
		</section>
	);
}
