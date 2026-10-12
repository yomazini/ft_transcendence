"use client";


import {
  ArrowRight,
  Lightbulb,
  Moon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import SectionTitle from "./SectionTitle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Users} from "lucide-react";




export default function Welcome() {

    const totalUsers = 20
    const freeUsers = 15


    return (
        <section className="grid min-w-0 grid-cols-1 overflow-hidden border lg:grid-cols-3">
            <div className="relative flex min-h-[205px] min-w-0 flex-col justify-center gap-3 p-5 sm:p-6 lg:col-span-2">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                        Good Evening, Katrina
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
							<DropdownMenuItem onClick={() => exportRep(id, "CSV")}>Export as CSV</DropdownMenuItem>
							<DropdownMenuItem onClick={() => exportRep(id, "XLSX")}>Export as XLSX</DropdownMenuItem>
							<DropdownMenuItem onClick={() => exportRep(id, "JSON")}>Export as JSON</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
                    {/* <Button className="mt-1">
                        View Full Report
                        <ArrowRight className="ml-2 size-4" />
                    </Button> */}
                </div>
            </div>

            <div className="min-w-0 border-t lg:border-l lg:border-t-0">
                <SectionTitle icon={Lightbulb}>Key Insights</SectionTitle>

                <div className="space-y-2 p-4">
                    <p className="text-2xl font-semibold tracking-tight sm:text-3xl flex items-center ">
                        <Users className="size-5 mr-2" /> {totalUsers}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-emerald-600">5</span>
                        <span className="ml-2">available places</span>
                    </p>

                    <div
                        className="flex h-5 gap-[3px] overflow-hidden"
                        aria-label="Regional performance indicator"
                    >
                        {Array.from({ length: 48 }).map((_, i) =>
                         (
                            i < (((totalUsers - freeUsers) * 48) / totalUsers) ? 
                            <div
                                key={i}
                                className="min-w-[3px] flex-1 rounded-[5px]  bg-[#171717] dark:bg-white"
                            /> : 
                             <div
                                key={i}
                                className="min-w-[3px] flex-1 rounded-[5px]  bg-[#858585]" />
                                
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-xs">
                        {[
                            ["Allocated", "bg-neutral-900"],
                            ["Available", "bg-neutral-500"],
                        ].map(([label, color]) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <span className={`size-2 rounded-full ${color}`} />
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}



