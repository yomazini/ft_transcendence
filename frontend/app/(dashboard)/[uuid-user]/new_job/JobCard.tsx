import { Card, CardContent } from "@/components/ui/card"
import type { JobItem, JobStatus } from "@/lib/api/jobs";
import { RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { useDeleteJobById } from "./deleteJob";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { notifyUser } from "./submitJob";
import { useUpdateJobById } from "./useUpdateJobById";
import { stat } from "fs";
import { Role } from "@/lib/auth";
import { RoleButton } from "./RoleButton";

interface JobCardProps {
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

export function JobCard( {key,  role, jobs } : JobCardProps) {
	const deleteJob = useDeleteJobById()
	const updateJob = useUpdateJobById()
	// const router = useRouter();
	// const userId = useParams<{ "uuid-user": string }>()["uuid-user"];
	const { status, mode, created_at, id, org_id, name } = jobs;
	async function deleteButton() {
		// await deleteJob(id)
		try {
			await deleteJob.mutateAsync(id);
			// router.push(`/${userId}/new_job`)
		} catch (err) {
			notifyUser("Something went wrong", false)
		}
	}
	async function updateButton() {
		// await deleteJob(id)
		try {
			await updateJob.mutateAsync(id);
			// router.push(`/${userId}/new_job`)
		} catch (err) {
			notifyUser("Something went wrong", false)
		}
	}

	return (
		<Card key={key} className="w-full rounded-md p-0">
			<CardContent className="flex flex-col gap-2 py-3 px-4">
				<Link href={`/${org_id}/dashboard?job=${id}`} className="flex items-center justify-between">
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