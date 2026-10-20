// "use client";

// import { Cards } from "@/components/dashboard/swot-cards";
// import { VisualizerCard } from "@/components/dashboard/visualizer-card";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { SelectContent, SelectTrigger } from "@/components/ui/select";
// import { useExportReport } from "@/hooks/use-exportReport";
// import { useReportById } from "@/hooks/useReportById";
// import { Button, Select, SelectValue } from "@base-ui/react";
// import { ActivityIcon, CalendarDays, CheckCircle2, Clock3, Compass, Download, Link, Loader2, MinusCircle, PlusCircle, RefreshCcw, ShieldCheck, Target, Trash2, TrendingUp, Waves, Zap } from "lucide-react";
// import { use, useEffect, useState } from "react";
// import { Status } from "@/components/dashboard/projects-status"
// import { toast, Toaster } from "sonner";


// export default function DashboardPage({ params }: { params: Promise<{ "uuid-user": string }> }) {
// 	const { "uuid-user": id } = use(params);
// 	const { report, loading, error } = useReportById(id);
// 	const [activeCard, setActiveCard] = useState(1)
// 	const { expReport, expLoading, expError, exportRep } = useExportReport();


// 	useEffect(() => {
// 		if (expError) {
// 			toast.error("Export Failed", {
// 				description: expError.message,
// 				duration: 4000,
// 				position: "top-right",
// 			});
// 		}
// 	}, [expError]);
// 	function switchCard(card: number) {
// 		(card === 1 ? setActiveCard(2) : setActiveCard(1))
// 	}

// 	const handleExport = async (format: "CSV" | "XLSX" | "JSON") => {
// 		try {
// 			console.log('--------------------11-------->')
// 			await exportRep(id, format);

// 			toast.success("Report exported successfully!", {
// 				duration: 3000,
// 			});
// 		} catch (error) {
// 			console.log('--------------------222-------->')
// 			toast.error("Export Failed", {
// 				description:
// 					error instanceof Error
// 						? error.message
// 						: "Something went wrong",
// 				duration: 4000,
// 			})
// 		}
// 	};

// 	const swot = [
// 		{ items: report?.swot.strengths, icon: ShieldCheck, title: 'STRENGTHS', description: 'Internal advantages', iconColor: 'text-green-500' },
// 		{ items: report?.swot.weaknesses, icon: Link, title: 'WEAKNESSES', description: 'Internal limitations', iconColor: 'text-orange-500' },
// 		{ items: report?.swot.opportunities, icon: TrendingUp, title: 'OPPORTUNITIES', description: 'External possibilities', iconColor: 'text-indigo-500' },
// 		{ items: report?.swot.threats, icon: ShieldCheck, title: 'THREATS', description: 'Potential external risks', iconColor: 'text-red-500' },
// 	]

// 	const errc = [
// 		{ items: report?.blue_ocean.eliminate, icon: Trash2, title: 'ELIMINATE', description: 'Remove unnecessary factors', iconColor: 'text-red-500' },
// 		{ items: report?.blue_ocean.reduce, icon: MinusCircle, title: 'REDUCE', description: 'Lower factors below the standard', iconColor: 'text-purple-800' },
// 		{ items: report?.blue_ocean.raise, icon: TrendingUp, title: 'RAISE', description: 'Improve factors above the standard', iconColor: 'text-green-500' },
// 		{ items: report?.blue_ocean.create, icon: PlusCircle, title: 'CREATE', description: 'Introduce new factors', iconColor: 'text-indigo-600' },
// 	]

// 	const jobStatus = [
// 		{ status: "Runing", icon: Loader2, iconColor: 'text-orange-500', number: 10 },
// 		{ status: "Done", icon: CheckCircle2, iconColor: 'text-green-500', number: 20 },
// 		{ status: "Queued", icon: Clock3, iconColor: 'text-purple-500', number: 40 },
// 	]

// 	return (
// 		<div className="justify-center flex">
// 			<div className="flex flex-col h-full bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:16px_16px] border w-full">
// 				{/* w-[100%] min-[2000px]:w-[45%] */}
// 				<div className="flex justify-end py-2 px-5">
// 					<DropdownMenu>
// 						<DropdownMenuTrigger
// 							render={
// 								<Button
// 									className="btn-primary"
// 								>
// 									<Download className="h-4 w-4 shrink-0" />
// 									<span className="hidden sm:inline">Export data</span>
// 								</Button>
// 							}
// 						/>
// 						<DropdownMenuContent align="end">
// 							<DropdownMenuItem onClick={() => handleExport("CSV")}>
// 								Export as CSV
// 							</DropdownMenuItem>

// 							<DropdownMenuItem onClick={() => handleExport("XLSX")}>
// 								Export as XLSX
// 							</DropdownMenuItem>

// 							<DropdownMenuItem onClick={() => handleExport("JSON")}>
// 								Export as JSON
// 							</DropdownMenuItem>
// 						</DropdownMenuContent>
// 					</DropdownMenu>
// 				</div>

// 				<div className="gflex w-full flex-col gap-4 md:flex-row">

// 					<div>
// 						<div>
// 							<VisualizerCard report={report} />
// 						</div>

// 						<div className="flex flex-col lg:flex-row lg:h-[160px] w-full min-w-0 py-5">
// 							{jobStatus.map((item, i) => (
// 								<Status
// 									key={i}
// 									icon={item.icon}
// 									action={item.status}
// 									iconColor={item.iconColor}
// 									num={item.number}
// 								/>
// 							))}
// 						</div>
// 						<div className="flex ">
// 							<Card className="w-full lg:w-1/2 h-auto lg:h-[550px] min-w-0 rounded-none">
// 								<CardHeader className="border-b px-6">
// 									<CardTitle className="flex text-sm font-medium text-slate-800 grid-cols-2 gap-2">
// 										<ActivityIcon className="size-4 shrink-0 text-purple-500" />
// 										Strategic Analysis
// 									</CardTitle>
// 								</CardHeader>

// 								<CardContent >

// 									<div className="flex w-full min-w-0 justify-center">
// 										<div className="grid w-full min-w-0 max-w-[40%] grid-cols-2 gap-2 rounded-lg bg-slate-100 px-4 py-1">
// 											<button
// 												type="button"
// 												onClick={() => setActiveCard(1)}
// 												className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${activeCard === 1
// 														? "bg-white text-black shadow-sm"
// 														: "text-slate-500 hover:text-slate-800"
// 													}`}
// 											>
// 												<Target className="size-4 shrink-0" />
// 												<span className="min-w-0 truncate">SWOT</span>
// 											</button>

// 											<button
// 												type="button"
// 												onClick={() => setActiveCard(2)}
// 												className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${activeCard === 2
// 														? "bg-white text-black shadow-sm"
// 														: "text-slate-500 hover:text-slate-800"
// 													}`}
// 											>
// 												<Waves className="size-4 shrink-0" />
// 												<span className="min-w-0 truncate">Blue Ocean</span>
// 											</button>
// 										</div>
// 									</div>

// 									<div className="grid w-full min-w-0 grid-cols-1 gap-4 py-4 lg:grid-cols-2">
// 										{activeCard === 1
// 											? swot.map((item, i) => (
// 												<Cards
// 													key={i}
// 													items={item.items}
// 													icon={item.icon}
// 													title={item.title}
// 													description={item.description}
// 													iconColor={item.iconColor}
// 												/>
// 											))
// 											: errc.map((item, i) => (
// 												<Cards
// 													key={i}
// 													items={item.items}
// 													icon={item.icon}
// 													title={item.title}
// 													description={item.description}
// 													iconColor={item.iconColor}
// 												/>
// 											))}
// 									</div>

// 								</CardContent>
// 							</Card>

// 						</div>
// 					</div>
// 					{/* ) */}

// 					{/* </div> */}
// 				</div>
// 			</div>
// 		</div>
// 	)
// }


