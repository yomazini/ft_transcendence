import { Card, CardContent } from "@/components/ui/card"
import type { JobStatus } from "@/lib/api/jobs";
import { JobMode } from "@/lib/api/createJob"
import { RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link";
import { Job, STATUS_STYLE } from "./getJobs";
import { deleteJob } from "./deleteJob";



export function JobCard({status, mode, created_at, id, org_id, target}:Job){

	async function deleteButton(){
		await deleteJob(id)
	}

	return (
		<Card className="w-full rounded-md p-0">
			<CardContent className="flex flex-col gap-2 py-3 px-4">
				<Link href={`/${org_id}/dashboard?job=${id}`} className="flex items-center justify-between">
					<h3 className="font-medium truncate">{target}</h3>
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
					<div className="flex justify-end gap-1">
						<Button variant="ghost" size="icon">
							<RefreshCw />
						</Button>
						<Button onClick={deleteButton} variant="ghost" size="icon" className="hover:text-destructive">
							<Trash2 />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}