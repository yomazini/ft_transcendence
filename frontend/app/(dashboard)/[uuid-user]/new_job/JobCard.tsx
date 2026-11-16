import { Card, CardContent } from "@/components/ui/card"
import type { JobItem, JobStatus } from "@/lib/api/jobs";
import { Edit, RefreshCw, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { useDeleteJobById } from "./deleteJob";
import { notifyUser } from "./submitJob";
import { useUpdateJobById } from "./useUpdateJobById";
import { Role } from "@/lib/auth";
import { RoleButton } from "./RoleButton";
import { EditNameButton } from "./ConfirmationButton";
import { useUpdateJobNameById } from "./useUpdateJobName";

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
				<div className="flex x items-center justify-between">
					<p className="text-sm text-muted-foreground">{mode} ·{" "}
						<time dateTime={created_at.replace(" ", "T")}>
							{
								new Date(created_at.replace(" ", "T")).toLocaleString()
							}
						</time>
					</p>
					{status === "failed" || status === "done" ? (
						<div className="flex justify-end gap-1">
							<EditNameButton confirmFunc={editName} roles={["Analyst", "Admin"]} userRole={role} className="hover:text-yellow-500">
								<Edit/>
							</EditNameButton>
							<RoleButton roles={["Analyst", "Admin"]} userRole={role} onClick={updateButton} className="hover:text-orange-500">
								<RefreshCw />
							</RoleButton>
							<RoleButton roles={["Admin"]} userRole={role} onClick={deleteButton} className="hover:text-destructive">
								<Trash2 />
							</RoleButton>
						</div>
					): <></>}
				</div>
			</CardContent>
		</Card>
	)
}