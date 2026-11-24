import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Edit, RefreshCw, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import type { JobItem, JobStatus } from "@/lib/api/jobs";
import { useDeleteJobById } from "@/hooks/useDeleteJobById";
import { notifyUser } from "@/lib/new-job-utilities";
import { useUpdateJobById } from "@/hooks/useUpdateJobById";
import { Role } from "@/lib/auth";
import { useUpdateJobNameById } from "@/hooks/useUpdateJobName";
import { RoleConfirmButton } from "./RoleConfirmButton";

interface JobCardProps {
	userId: string
	key: string,
	role: Role | null
	jobs: JobItem
}

export const STATUS_STYLE: Record<JobStatus, string> = {
	queued: "bg-muted text-muted-foreground",
	running: "bg-blue-500/15 text-blue-500",
	scraping: "bg-blue-500/15 text-orange-500",
	done: "bg-green-500/15 text-green-500",
	failed: "bg-destructive/15 text-destructive",
};

export function JobCard( {key, userId,  role, jobs } : JobCardProps) {
	const [newName, setNewName] = useState("")
	const [allow, setAllow] = useState(false)
	const deleteJob = useDeleteJobById()
	const updateJob = useUpdateJobById()
	const updateJobName = useUpdateJobNameById()
	const { status, mode, created_at, id, name } = jobs;

	async function deleteButton() {
		try {
			await deleteJob.mutateAsync(id);
		} catch (err) {
			if (err instanceof Error) notifyUser(err.message, false)
			else notifyUser("Something went wrong", false)
		}
	}

	async function updateButton() {
		try {
			await updateJob.mutateAsync(id);
		} catch (err) {
			if (err instanceof Error) notifyUser(err.message, false)
			else notifyUser("Something went wrong", false)
		}
	}

	async function editName(name:string) {
		try {
			await updateJobName.mutateAsync({id, name});
		} catch (err) {
			if (err instanceof Error) notifyUser(err.message, false)
			else notifyUser("Something went wrong", false)
		}
	}

	return (
		<Card key={key} className="w-full rounded-md p-0">
			<CardContent className="flex flex-col gap-2 py-3 px-4">
				<Link href={`/${userId}/dashboard?job=${id}`} className="flex items-center justify-between">
					<h3 className="font-medium truncate">{name}</h3>
					<Badge className={STATUS_STYLE[status]}>{status}</Badge>
				</Link>
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">{mode} ·{" "}
						<time dateTime={created_at.replace(" ", "T")}>
							{
								new Date(created_at.replace(" ", "T")).toLocaleString()
							}
						</time>
					</p>
					{status === "failed" || status === "done" ? (
						<div className="flex justify-end gap-1">
							<RoleConfirmButton
								role={role} roles={["Admin", "Analyst"]} 
								trigger={<Button className="hover:text-yellow-500" variant="ghost" size="icon"><Edit/></Button>}
								cancel={<Button variant="outline">Cancel</Button>}
								confirm={
									<Button className="bg-yellow-500 hover:bg-yellow-400" disabled={!allow} onClick={async () => {
										await editName(newName);
										setNewName("");
										setAllow(false)
									}}>
										Save changes
									</Button>
								}
								title="Edit job name"
								description="Change the name of this item."
							>
								<Input max={40} value={newName} placeholder="EnterName" onChange={(val) => {
									setNewName(val.target.value);
									setAllow(val.target.value.trim() !== "" && /^[a-zA-Z0-9 _-]+$/.test(val.target.value.trim()));
								}}/>
							</RoleConfirmButton>
							<RoleConfirmButton 
								role={role} roles={["Admin", "Analyst"]}
								trigger={<Button className="hover:text-orange-500" variant="ghost" size="icon"><RefreshCw /></Button>}
								cancel={<Button variant="outline">No</Button>}
								confirm={<Button className="bg-orange-500 hover:bg-orange-400" onClick={updateButton}>Yes</Button>}
								title="Update Job"
								description="This may take some time are you sure?"
							/>
							<RoleConfirmButton 
								role={role} roles={["Admin"]}
								trigger={<Button className="hover:text-destructive" variant="ghost" size="icon"><Trash2 /></Button>}
								cancel={<Button variant="outline">No</Button>}
								confirm={<Button variant="destructive" className="bg-red-800 hover:bg-red-950 text-white font-bold" onClick={deleteButton}>Delete Forever<AlertTriangle/></Button>}
								title="Delete Job Permanently?"
								description="This action will permanently delete all data associated with this job. This action cannot be undone. Are you sure you want to continue?"
								danger={true}
							>
								<div className="rounded-md border border-red-800 bg-red-950 p-3 text-red-200">
									<div className="flex items-center gap-2 font-bold">
										<AlertTriangle className="h-5 w-5 text-red-500" />
										WARNING: PERMANENT DELETION
									</div>
									<p className="mt-1 text-sm text-red-300">
										All associated data will be permanently lost.
									</p>
								</div>
							</RoleConfirmButton>
						</div>
					): <></>}
				</div>
			</CardContent>
		</Card>
	)
}