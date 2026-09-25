import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/layout/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard/layout/dashboard-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
	const test : string[] = [
		"text1 dnkcwn cmew ,c w",
		"text2 ipsum dolor sit amet.",
		"text3 ipsum dolor sit amet.",
		"text4 ipsum dolor sit amet.",
		"text5 ipsum dolor sit amet.",
		"text6 ipsum dolor sit amet.",
		"text7 ipsum dolor sit amet.",
		"text8 ipsum dolor sit amet.",
		"text9 ipsum dolor sit amet.",
		"text10 ipsum dolor sit amet.",
		"text11 ipsum dolor sit amet.",
		"text12 ipsum dolor sit amet.",
		"text13 ipsum dolor sit amet.",
		"text14 ipsum dolor sit amet.",
		"text15 ipsum dolor sit amet.",
		"text16 ipsum dolor sit amet.",
		"text17 ipsum dolor sit amet.",
		"text18 ipsum dolor sit amet.",
		"text19 ipsum dolor sit amet.",
		"text20 ipsum dolor sit amet.",
		"text21 ipsum dolor sit amet.",
		"text22 ipsum dolor sit amet.",
		"text23 ipsum dolor sit amet.",
		"text24 ipsum dolor sit amet.",
		"text25  kfwkejnfkwefjkewnf",
	];
	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "20rem",
					"--sidebar-width-mobile": "20rem",
				} as React.CSSProperties
			}
		>
			<AppSidebar jobs={test} />

			<div className="flex min-h-screen min-w-0 flex-1 flex-col">
				<DashboardNavbar />
				<main className="min-w-0 flex-1 w-full min-h-screen ">
					<div className="mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8">
						{children}
					</div>
				</main>
			</div>
		</SidebarProvider>
	)
}