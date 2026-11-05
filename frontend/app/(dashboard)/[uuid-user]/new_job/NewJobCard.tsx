"use client";
import { type JobMode } from "@/lib/api/createJob";
import { TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { notifyUser, submitJob } from "./submitJob";

const MODES: { value: JobMode; label: string; placeholder: string }[] = [
	{ value: "post", label: "Post URL", placeholder: "https://www.reddit.com/r/.../comments/..." },
	{ value: "subreddit", label: "Subreddit", placeholder: "r/freelance" },
	{ value: "keyword", label: "Keyword", placeholder: "invoicing app" },
	{ value: "user", label: "User", placeholder: "u/spez" },
];

const DOMAINS=["www.reddit.com", "reddit.com"]

function checkInputUrl(target:string): boolean
{
	try {
		const url = new URL(target)
		const urlpath = url.pathname.split("/").filter(Boolean)
		if (url.protocol !== 'https:'
			|| !DOMAINS.includes(url.hostname)
			|| url.pathname[0] !== "/"
			|| urlpath.length !== 5
			|| urlpath[0] !== "r"
			|| urlpath[2] !== "comments")
		{
			notifyUser("Malformed post url", false)
			return false
		}
	} catch (error) {
		notifyUser("Invalid URL", false)
		return false
	}
	return true
}

function checkInput(target: string, mode: JobMode): boolean
{
	if (target === "")
	{
		notifyUser("Empty string", false)
		return false;
	}
	else if (mode === "post")
		return checkInputUrl(target)
	return true
}

export default function NewJobCard()
{
	const [mode, setMode] = useState<JobMode>(MODES[0].value);
	const [sending, setSending] = useState<boolean>(false);
	const placeholder = MODES.find((m) => m.value == mode)?.placeholder;

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget)
		const target = (formData.get("target") as string).trim()
		if (!checkInput(target, mode))
			return;
		
		setSending(true)
		await submitJob(mode, target)
		setSending(false)
	}

	return (
		<section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-6 py-12">
			<div className="space-y-1">
				<h2 className="text-2xl font-semibold tracking-tight text-foreground">
					New analysis job
				</h2>
				<p className="text-sm text-muted-foreground">
					choose a source and start exploring Reddit insights
				</p>
			</div>
			<Tabs defaultValue={mode} onValueChange={(e) => setMode(e as JobMode)}>
				<TabsList className="w-full justify-start bg-muted">
					{
						MODES.map((mode) => (
							<TabsTrigger key={mode.value} value={mode.value} className="flex-1">
								{mode.label}
							</TabsTrigger>
						))
					}
				</TabsList>
			</Tabs>
			<div className="flex flex-col gap-0.5">
				<form onSubmit={handleSubmit} className="flex items-center rounded-lg border border-input bg-background px-1.5 py-1.5">
					<Input
						name="target"
						placeholder={placeholder}
						className="h-9 min-w-0 flex-1 rounded-l-lg rounded-r-none border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
					/>
					<Button type="submit" disabled={sending} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-l-none rounded-r-lg border border-primary bg-primary text-primary-foreground hover:bg-primary/90">
						{ sending ? (
								<>
									sending...
									<LoaderCircle className="size-4 animate-spin" />
								</>
							) : (
								<>
									Start job
									<Send className="size-4" />
								</>
							)
						}
						
					</Button>
				</form>
			</div>
		</section>
	)
}