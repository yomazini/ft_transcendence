"use client";
import Link from "next/link"
import {
	ShoppingCart,
	House,
	Sparkles,
	CreditCard,
	Settings,
	Users,
	FileText,
	MoreHorizontal,
	Trash2,
	ChevronRight,
	HelicopterIcon,
	HospitalIcon,
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
import { useQuery } from "@tanstack/react-query"
import { listJobs } from "@/lib/api/jobs"
import { useDeleteRepById } from "@/hooks/useDeleteRepById"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

/** Pages under /<user id>/…; the id is read from the current URL. */
const dashboardItems = [
	{ title: "New Job", page: "new_job", icon: House },
	{ title: "Billing", page: "billing", icon: CreditCard, adminOnly: true },
	{ title: "Members", page: "members", icon: Users },
	{ title: "Setting", page: "setting", icon: Settings },
]


export function AppSidebar() {
	const router = useRouter();
	const pathname = usePathname();
	const userId = useParams<{ "uuid-user": string }>()["uuid-user"];
	// Same cached list as the Jobs panel, which keeps it updated live.
	const { data: jobs = [], isLoading: loading, error } = useQuery({ queryKey: ["jobs"], queryFn: listJobs });
	const selectedJob = useSearchParams().get("job");
	const deleteReport = useDeleteRepById();
	const { user } = useCurrentUser();
	const visibleItems = dashboardItems.filter((item) => !item.adminOnly || user?.role === "Admin");

	const handleDelete = async (id: string) => {
		try {
			await deleteReport.mutateAsync(id);
			router.push(`/${userId}/dashboard`);
		} catch (err) {
			console.log("error", err);
		}
	};

	return (
		<Sidebar
			variant="sidebar"
			collapsible="icon"
			className="border bg-white dark:bg-black"
		>
			{/* Logo */}
			<SidebarHeader className="border-b">
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
									<SidebarMenuItem key={item.title}>
										{/* The whole row is the link (a link inside a button is invalid HTML). */}
										<SidebarMenuButton
											tooltip={item.title}
											isActive={pathname === href}
											render={<Link href={href} />}
										>
											<item.icon />
											<span className="font-medium">{item.title}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
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
													<span className="truncate">{report.target}</span>
													<span className="ml-auto text-[10px] text-muted-foreground">{report.status}</span>
												</SidebarMenuButton>

												<DropdownMenu>
													<DropdownMenuTrigger
														render={
															<button
																type="button"
																className="absolute right-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-transparent text-gray-400 opacity-0 transition-all hover:bg-gray-200/70 hover:text-gray-900 group-hover:opacity-100"
															>
																<MoreHorizontal className="h-4 w-4" />
															</button>
														}
													/>

													<DropdownMenuContent
														align="end"
														className="w-40"
													>
														<DropdownMenuItem
															className="text-red-500 focus:text-red-500"
															onClick={() => handleDelete(report.id)}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
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