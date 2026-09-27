"use client"

import { Download, CheckCircle2, Loader2, Clock3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardNavbar() {
	return (
		<nav className="sticky top-0 z-5 w-full p-2">
			<div
				className="
					flex w-full min-w-0
					items-center gap-2
					border-rounded
					bg-white p-2 shadow-sm

					sm:gap-3 sm:p-4
					lg:px-5
				"
			>
				<div className="min-w-0 shrink-0 md:hidden">
					<SidebarTrigger />
				</div>

				{/* Page title */}
				<div className="min-w-0 shrink-0">
					<h1 className="truncate text-lg font-bold text-slate-800">
						Dashboard
					</h1>
				</div>

				{/* Job status */}
				<div
					className="
						sticky flex w-full min-w-0 flex-1
						flex-nowrap items-center justify-end gap-1

						sm:gap-2
						lg:ml-auto
					"
				>
					{/* Done jobs */}
					<div className="job-status-card group border-rounded">
						<div className="relative flex min-w-0">
							<span className="absolute inset-0 animate-ping rounded-full bg-orange-400/30" />
							<CheckCircle2 className="relative h-4 w-4 text-orange-500" />
						</div>

						<div className="job-status-label">
							<p className="job-status-label-text">Done</p>
							<p className="job-status-value">24</p>
						</div>
					</div>

					{/* Running jobs */}
					<div className="job-status-card group border-rounded">
						<div className="job-status-icon-box bg-orange-100 group-hover:bg-orange-50">
							<Loader2 className="h-4 w-4 animate-spin text-orange-500" />
						</div>

						<div className="job-status-label">
							<p className="job-status-label-text">Running</p>
							<p className="job-status-value">5</p>
						</div>
					</div>

					{/* Queued jobs */}
					<div className="job-status-card group border-rounded">
						<div className="job-status-icon-box bg-orange-50 group-hover:bg-orange-100">
							<Clock3 className="h-4 w-4 animate-bounce text-orange-500" />
						</div>

						<div className="job-status-label">
							<p className="job-status-label-text">Queued</p>
							<p className="job-status-value">12</p>
						</div>
					</div>

					{/* Actions */}
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									className="btn-primary"
								>
									<Download className="h-4 w-4 shrink-0" />
									<span className="hidden sm:inline">Export data</span>
								</Button>
							}
						/>

						<DropdownMenuContent align="end">
							<DropdownMenuItem>Export as CSV</DropdownMenuItem>
							<DropdownMenuItem>Export as Excel</DropdownMenuItem>
							<DropdownMenuItem>Export as JSON</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</nav>
	)
}