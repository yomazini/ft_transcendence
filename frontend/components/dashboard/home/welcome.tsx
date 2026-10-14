"use client";

import {
  Moon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download} from "lucide-react";
import Image from "next/image";
import { exportReport } from "@/lib/api/exportReport";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSelectedJobId } from "@/hooks/useSelectedJob";


export default function Welcome() {
    const { name } = useCurrentUser();

    const id = useSelectedJobId();

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
							<DropdownMenuItem onClick={() => id && exportReport(id, "CSV")}>Export as CSV</DropdownMenuItem>
							<DropdownMenuItem onClick={() => id && exportReport(id, "XLSX")}>Export as XLSX</DropdownMenuItem>
							<DropdownMenuItem onClick={() => id && exportReport(id, "JSON")}>Export as JSON</DropdownMenuItem>
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



