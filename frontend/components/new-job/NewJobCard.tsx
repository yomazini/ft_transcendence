
"use client";

import { TabsList, Tabs, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import { type JobMode } from "@/lib/api/createJob";
import { useCreateJob } from "@/hooks/useCreateJob";
import { useUserRole } from "@/hooks/useUserRole";
import { checkInput, notifyUser } from "@/lib/new-job-utilities";

const MODES: { value: JobMode; label: string; placeholder: string }[] = [
	{ value: "post", label: "Post URL", placeholder: "https://www.reddit.com/r/.../comments/..." },
	{ value: "subreddit", label: "Subreddit", placeholder: "r/freelance" },
	{ value: "keyword", label: "Keyword", placeholder: "invoicing app" },
	{ value: "user", label: "User", placeholder: "user/spez" },
];

export default function NewJobCard()
{
	const [mode, setMode] = useState<JobMode>(MODES[0].value);
	const placeholder = MODES.find((m) => m.value === mode)?.placeholder;
	const createJobMutation = useCreateJob();
	const role = useUserRole()

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget)
		const target = (formData.get("target") as string).trim()
		const result = checkInput(target, mode)
		if (result === null)
			return;
		
		try {
			await createJobMutation.mutateAsync({
				mode,
				target: result
			})
		} catch (err) {
			if (err instanceof Error) notifyUser(err.message, false)
			else notifyUser("Something went wrong", false)
		}
	}

	if (role !== "Admin" && role !== "Analyst")
		return <></>
	return (
		<section className="relative mx-auto flex w-full flex-col gap-7 overflow-hidden rounded-3xl border border-orange-500/10 bg-white px-6 py-12 shadow-xl shadow-orange-500/5 dark:border-orange-500/15 dark:bg-zinc-950/80 dark:shadow-orange-950/20 sm:px-10">

			<div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-orange-100/70 via-amber-50/30 to-transparent dark:from-orange-500/10 dark:via-amber-500/5 dark:to-transparent" />

			<div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/10" />

			<div className="relative z-10 space-y-2">
				<h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
					New analysis job
				</h2>
				<p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
					choose a source and start exploring Reddit insights
				</p>
			</div>

			<Tabs defaultValue={mode} onValueChange={(e) => setMode(e as JobMode)}>
				<TabsList className="relative z-10 h-24  w-full justify-start 
				rounded-xl border border-orange-200/70 bg-orange-50/80
				 p-1.5 shadow-inner dark:border-white/10 dark:bg-zinc-900/90" style={{height : "58px"}}>
					{
						MODES.map((mode) => (
							<TabsTrigger
								key={mode.value}
								value={mode.value}
								className="min-w-0 flex-1 h-11 my-4  
								rounded-lg px-2 py-2.5 text-xs 
								font-medium text-zinc-700 
								transition-all duration-200 hover:bg-orange-100/70 hover:text-orange-800 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:via-orange-400 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-orange-500/20 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-300 dark:data-[state=active]:text-zinc-950 sm:text-sm"
							>
								{mode.label}
							</TabsTrigger>
						))
					}
				</TabsList>
			</Tabs>

			<div className="relative z-10 flex flex-col gap-0.5">
				<form
					onSubmit={handleSubmit}
					className="flex items-center rounded-xl border border-orange-200 bg-white px-1.5 py-1.5 shadow-sm shadow-orange-500/5 transition-all duration-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-500/10 dark:border-orange-500/20 dark:bg-zinc-900 dark:shadow-orange-950/10 dark:focus-within:border-orange-500/60 dark:focus-within:ring-orange-500/10"
				>
					<Input
						name="target"
						placeholder={placeholder}
						className="h-11 min-w-0 flex-1 rounded-l-lg rounded-r-none border-0 bg-transparent px-3 text-sm text-zinc-900 shadow-none placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-zinc-100 dark:placeholder:text-zinc-400"
					/>

					<Button
						type="submit"
						disabled={createJobMutation.isPending}
						className="inline-flex h-11 shrink-0 items-center gap-2 rounded-l-none rounded-r-lg border border-orange-500 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-5 font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:via-orange-500 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-500/25 dark:text-zinc-950"
					>
						{ createJobMutation.isPending ? (
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
