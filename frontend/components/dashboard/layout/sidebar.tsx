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
import { useReports } from "@/hooks/useReports"
import { useDeleteRepById } from "@/hooks/useDeleteRepById"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useRouter } from "next/navigation";

const dashboardItems = [
  {
    title: "Home",
    url: "/33/dashboard",
    icon: House,
  },
  {
    title: "Management",
    url: "/33/management",
    icon: ShoppingCart,
  },
  {
    title: "Chats",
    url: "/33/chats",
    icon: Sparkles,
  },
  {
    title: "Billing",
    url: "/33/billing",
    icon: CreditCard,
  },
  {
    title: "Setting",
    url: "/33/setting",
    icon: Settings,
  },
]

const appItems = [
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
  },
]

export function AppSidebar() {
	const router = useRouter();
	const { reports, loading, error } = useReports();
	const deleteReport = useDeleteRepById();

	const handleDelete = async (id: string) => {
		try {
			await deleteReport.mutateAsync(id);
			router.push("/33/billing");
		} catch (err) {
			console.log("error", err);
		}
	};

	return (
		<Sidebar
			variant="sidebar"
			collapsible="icon"
			className="border bg-white"
		>
		{/* Logo */}
		<SidebarHeader className="border-b">
			<div className="flex h-14 items-center gap-3 px-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-black text-white">
					<span className="text-lg font-bold">
						I
					</span>
				</div>

				<div className="flex flex-1 flex-col">
					<span className="text-sm font-semibold">
						InsightFlow
					</span>

					<span className="text-[11px] text-muted-foreground">
						Dashboard
					</span>
				</div>

				<span className="rounded border px-1.5 py-0.5 text-[10px] font-medium">
					V1.0
				</span>
			</div>
		</SidebarHeader>

		<SidebarContent>
			{/* Dashboard */}
			<SidebarGroup>
			<SidebarGroupLabel>
				DASHBOARD
			</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu className="space-y-2">
				{dashboardItems.map((item) => (
					<SidebarMenuItem key={item.title}>
					<SidebarMenuButton  tooltip={item.title}>
						<Link href={item.url} className="flex space-x-3">
						<item.icon />
						<span className="font-bold ">{item.title}</span>
						</Link>
					</SidebarMenuButton>
					</SidebarMenuItem>
				))}
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
										reports.map((report) => (
											<SidebarMenuItem
												key={report.id}
												className="group relative"
											>

											<SidebarMenuButton
												className="report-menu-button"
												render={<Link href={`/${report.id}/dashboard`} />}
											>
												<span className="report-dot" />
												<span className="truncate">{report.id}</span>
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
			{/* Apps */}
			{/* <SidebarGroup>
			<SidebarGroupLabel>
				APPS
			</SidebarGroupLabel>

			<SidebarGroupContent>
				<SidebarMenu>
				{appItems.map((item) => (
					<SidebarMenuItem key={item.title}>
					<SidebarMenuButton  tooltip={item.title}>
						<Link href={item.url}>
						<item.icon />
						<span>{item.title}</span>
						</Link>
					</SidebarMenuButton>
					</SidebarMenuItem>
				))}
				</SidebarMenu>
			</SidebarGroupContent>
			</SidebarGroup>*/}
		</SidebarContent> 

		{/* Footer */}
		{/* <SidebarFooter className="border-t">
			<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton  tooltip="Settings">
				<Link href="/dashboard/settings">
					<Settings />
					<span>Settings</span>
				</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
			</SidebarMenu>
		</SidebarFooter> */}
		</Sidebar>
	)
}