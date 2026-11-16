"use client";
import Link from "next/link"
import {
	House,
	CreditCard,
	Settings,
	Users,
	ChevronRight,
} from "lucide-react"

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/useCurrentUser"

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useJobsLive } from "@/hooks/useJobsLive";

/** Pages under /<user id>/…; the id is read from the current URL. */
const dashboardItems = [
	{ title: "New Job", page: "new_job", icon: House },
	{ title: "Billing", page: "billing", icon: CreditCard, adminOnly: true },
	{ title: "Members", page: "members", icon: Users },
	{ title: "Setting", page: "setting", icon: Settings },
]


export function AppSidebar() {
	const pathname = usePathname();
	const userId = useParams<{ "uuid-user": string }>()["uuid-user"];
	const { jobs = [], loading: loading , error} = useJobsLive();
	const selectedJob = useSearchParams().get("job");
	const { user } = useCurrentUser();
	const visibleItems = dashboardItems.filter((item) => !item.adminOnly || user?.role === "Admin");

	return (
		<Sidebar
			variant="sidebar"
			collapsible="icon"
			className="border bg-white dark:bg-black"
		>
			{/* Logo */}
			<SidebarHeader className="border-b">
				<Link href="/">


					<div className="flex h-14 items-center gap-3 ">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black text-white">
							<span className="text-lg font-bold">
								I
							</span>
						</div>

						<div className="flex flex-1 flex-col pl-5">
							<span className="text-sm font-semibold">
								InsightFlow
							</span>

							<span className="text-[11px] text-muted-foreground">
								Dashboard
							</span>
						</div>
					</div>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Dashboard */}
				<SidebarGroup>
					<SidebarGroupLabel>
						DASHBOARD
					</SidebarGroupLabel>

					<SidebarGroupContent>
						<SidebarMenu className="gap-1">
							{visibleItems.map((item) => {
								const href = `/${userId}/${item.page}`;
								return (
									<SidebarMenuButton
										tooltip={item.title}
										isActive={pathname === href}
										render={<Link href={href} />}
										className=" rounded-xl transition-colors duration-200
											hover:bg-orange-500
											data-[active=true]:bg-orange-500
											data-[active=true]:hover:bg-orange-600 "
									>
										<item.icon />
										<span className="font-medium">{item.title}</span>
									</SidebarMenuButton>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					<Collapsible defaultOpen>
						<CollapsibleTrigger>
							<SidebarGroupLabel>
								Jobs
								<ChevronRight
									className="ml-auto transition-transform duration-200 [[data-state=open]_&]:rotate-90"
								/>
							</SidebarGroupLabel>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<SidebarGroupContent>
								<SidebarMenu className="gap-1.5 px-2">
									{loading ? (
										<div className="flex items-center justify-center">
											<h1>Loading reports...</h1>
										</div>
									) : error ? (
										<div>
											<h1>Failed to load reports {error.message}</h1>
										</div>
									) : (
										jobs.map((report) => (
											<SidebarMenuItem
												key={report.id}
												className="group relative"
											>

												<SidebarMenuButton
													className="report-menu-button"
													isActive={selectedJob === report.id}
													render={<Link href={`/${userId}/dashboard?job=${report.id}`} />}
												>
													<span className="report-dot" />
													<span className="truncate">{report.name}</span>
													<span className="ml-auto text-[10px] text-muted-foreground">{report.status}</span>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))
									)}
								</SidebarMenu>
							</SidebarGroupContent>
						</CollapsibleContent>
					</Collapsible>
				</SidebarGroup>

			</SidebarContent>


		</Sidebar>
	)
}