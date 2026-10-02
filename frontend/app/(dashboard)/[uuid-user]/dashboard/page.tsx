"use client";

import { Cards } from "@/components/dashboard/swot-cards";
import { VisualizerCard } from "@/components/dashboard/visualizer-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useExportReport } from "@/hooks/use-exportReport";
import { useReportById } from "@/hooks/useReportById";
import { Button } from "@base-ui/react";
import { Download, Link, MinusCircle, PlusCircle, ShieldCheck, Trash2, TrendingUp, Zap } from "lucide-react";
import { use, useState } from "react";


export default function DashboardPage({ params }: { params: Promise<{ "uuid-user": string }>})
{
	const { "uuid-user" : id } = use(params);
	const { report , loading, error } = useReportById(id);
	const [activeCard, setActiveCard] = useState(1)
	const { expReport, expLoading, expError , exportRep} = useExportReport();


	function switchCard(card : number) {
		(card === 1 ? setActiveCard(2) : setActiveCard(1))
	}
	const swot = [
		{items: report?.swot.strengths, icon: ShieldCheck, title: 'STRENGTHS', description: 'Internal advantages'},
		{items: report?.swot.weaknesses, icon: Link, title: 'WEAKNESSES', description: 'Internal limitations'},
		{items: report?.swot.opportunities, icon: TrendingUp, title: 'OPPORTUNITIES', description: 'External possibilities'},
		{items: report?.swot.threats, icon: ShieldCheck, title: 'THREATS', description: 'Potential external risks'},
	]
	
	const errc = [
		{items: report?.blue_ocean.eliminate, icon: Trash2, title: 'ELIMINATE', description: 'Remove unnecessary factors'},
		{items: report?.blue_ocean.reduce, icon: MinusCircle, title: 'REDUCE', description: 'Lower factors below the standard'},
		{items: report?.blue_ocean.raise, icon: TrendingUp, title: 'RAISE', description: 'Improve factors above the standard'},
		{items: report?.blue_ocean.create, icon: PlusCircle, title: 'CREATE', description: 'Introduce new factors'},
	]
	return (
		<div className="space-y-6 h-screen w-scree">
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 max-h-screen h-full">
				{
					loading ? (
						<div>Report Loading...</div>
					) : error ? (
						<div>ERROR {error.message}</div>
					) :  (
						<>
							<div className="w-full" >
								<VisualizerCard report={report}/>

							</div>

							<div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{activeCard === 1 ? (
										swot.map((item, i) => (
										<Cards key={i} items={item.items} icon={item.icon} title={item.title} description={item.description} />
										))
									) : (
										errc.map((item, i) => (
										<Cards key={i} items={item.items} icon={item.icon} title={item.title} description={item.description} />
										))
									)}
								</div>

								<div className="mt-4 flex justify-end">
									<button
										onClick={() => switchCard(activeCard)}
										className="group btn-secondary"
									>
										<span className="h-2 w-2 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-125" />
										{activeCard === 1 ? "SWOT" : "ERRC"}
									</button>
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
								</div>
							</div>
						</>
					)
				}
			</div>
		</div>
	)
}


