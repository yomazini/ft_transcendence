"use client";

import {
	Moon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { useExportReport } from "@/hooks/use-exportReport";
import { toast } from "sonner";

export default function Welcome() {
	const { name } = useCurrentUser();
	const { expReport, expLoading, expError, exportRep } = useExportReport();

	const id = useSelectedJobId();

	const handleExport = async (format: "CSV" | "XLSX" | "JSON") => {
		try {
			await exportRep(id, format);

			toast.success("Report exported successfully!", {
				duration: 3000,
			});
		} catch (error) {
			toast.error("Export Failed", {
				description:
					error instanceof Error
						? error.message
						: "Something went wrong",
				duration: 4000,
			})
		}
	};
	return (
		<section className="grid min-w-0 grid-cols-1 overflow-hidden border lg:grid-cols-3 ">
			<div className="relative flex min-h-[205px] min-w-0 flex-col justify-center gap-3 p-5 sm:p-6 lg:col-span-2">
				<div className="flex items-center gap-2">
					<h1 className="text-lg font-semibold tracking-tight sm:text-xl">
						Good Evening{name ? `, ${name}` : ""}
					</h1>
					<Moon className="size-5" />
				</div>

				<p className="max-w-sm text-sm leading-6 text-muted-foreground">
					Stay informed with today&apos;s analytics. Get a quick snapshot of
					key statistics.
				</p>

				<div>
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
							<DropdownMenuItem onClick={() => handleExport("CSV")}>
								Export as CSV
							</DropdownMenuItem>

							<DropdownMenuItem onClick={() => handleExport("XLSX")}>
								Export as XLSX
							</DropdownMenuItem>

							<DropdownMenuItem onClick={() => handleExport("JSON")}>
								Export as JSON
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

				</div>
			</div>
			<div className="flex justify-end">
				<Image
					src="/analytic-user.svg"
					width={300}
					height={300}
					alt="analytic-user"
					className="" />
			</div>
		</section>
	)
}
