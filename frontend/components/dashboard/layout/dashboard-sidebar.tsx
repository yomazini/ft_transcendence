"use client";

import {
	Home,
	Settings,
	Ellipsis,
	User,
	Sparkles,
	LogOut,
	LayoutDashboard,
	ChartNoAxesCombined,
	Users,
	ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible"


const projects = [
	{ name: "Home", url: "/", icon: Home },
	{ name: "Analytics", url: "/analytics", icon: ChartNoAxesCombined },
	{ name: "AI Reports", url: "/ai-reports", icon: Sparkles },
	{ name: "Competitors", url: "/competitors", icon: Users },
	{ name: "Dashboard", url:"/dashboard", icon: LayoutDashboard},
	{ name: "Settings", url: "/", icon: Settings},
	{ name: "More", url: "/", icon: Ellipsis},
];

export function AppSidebar({jobs} : {jobs : string[]}) {
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<div className="flex px-4 rounded-lg items-center justify-between py-4 group-data-[collapsible=icon]:justify-center">
					<div className="flex items gap-2 items-center group-data-[collapsible=icon]:mx-auto">
						<div className="sidebar-hover-lift sidebar-icon-box group-data-[collapsible=icon]:hidden">
							O
						</div>

						<span className="font-semibold group-data-[collapsible=icon]:hidden">
							OSSAMA
						</span>
					</div>

					<SidebarTrigger />
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{projects.map((project) => (
							<SidebarMenuItem key={project.name} className="flex justify-center font-bold">
								<SidebarMenuButton
									tooltip={project.name}
									render={<a href={project.url} />}
									className="sidebar-hover-lift px-5 py-5"
								>
									<project.icon />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										{project.name}
									</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>

				<Collapsible>
					<SidebarGroup className="group-data-[collapsible=icon]:hidden">
						<CollapsibleTrigger>
							<SidebarGroupLabel className="cursor-pointer">
								Jobs
								<ChevronDown className="ml-auto transition-transform duration-200" />
							</SidebarGroupLabel>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<SidebarGroupContent>
								<SidebarMenu className="gap-1.5 px-2">
									{jobs.map((job) => (
										<SidebarMenuItem key={job}>
											<SidebarMenuButton className="job-menu-button group">
												<span className="job-dot" />
												<span className="truncate">{job}</span>
											</SidebarMenuButton>
										</SidebarMenuItem>
									))}
								</SidebarMenu>
							</SidebarGroupContent>
						</CollapsibleContent>
					</SidebarGroup>
				</Collapsible>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu className="w-full">
					<SidebarMenuItem className="w-full">
						<DropdownMenu>
							<DropdownMenuTrigger className="w-full">
								<SidebarMenuButton
									size="lg"
									className="sidebar-hover-lift w-full rounded-xl data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-5 py-10"
								>
									<div className="sidebar-avatar-box">
										OS
									</div>

									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											Ossama Souadi
										</span>
										<span className="truncate text-xs text-muted-foreground">
											My Organization
										</span>
									</div>
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							<DropdownMenuContent side="top" align="start" className="w-56">
								<DropdownMenuItem>
									<User />
									<span>Account</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Sparkles />
									<span>Go Pro</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<LogOut />
									<span>Logout</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
