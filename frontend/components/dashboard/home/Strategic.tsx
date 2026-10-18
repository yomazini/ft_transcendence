"use client";

import { useEffect, useState } from "react";
import {
	Activity,
	Globe,
	Link,
	Megaphone,
	MinusCircle,
	PlusCircle,
	ShieldCheck,
	Target,
	Trash2,
	TrendingUp,
	Users,
	Waves,
} from "lucide-react";

import SectionTitle from "./SectionTitle";
import { useReportById } from "@/hooks/useReportById";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { Cards } from "../swot-cards";




export default function Strategic() {
	const id = useSelectedJobId();
	const [activeCard, setActiveCard] = useState<1 | 2>(1);

	const { report, loading, error } = useReportById(id);
	const swot = [
		{
			items: report?.swot?.strengths ?? [],
			icon: ShieldCheck,
			title: "STRENGTHS",
			description: "Internal advantages",
			iconColor: "text-green-500",
		},
		{
			items: report?.swot?.weaknesses ?? [],
			icon: Link,
			title: "WEAKNESSES",
			description: "Internal limitations",
			iconColor: "text-orange-500",
		},
		{
			items: report?.swot?.opportunities ?? [],
			icon: TrendingUp,
			title: "OPPORTUNITIES",
			description: "External possibilities",
			iconColor: "text-indigo-500",
		},
		{
			items: report?.swot?.threats ?? [],
			icon: ShieldCheck,
			title: "THREATS",
			description: "Potential external risks",
			iconColor: "text-red-500",
		},
	];

	const blueOcean = [
		{
			items: report?.blue_ocean?.strategy?.eliminate ?? [],
			icon: Trash2,
			title: "ELIMINATE",
			description: "Remove unnecessary factors",
			iconColor: "text-red-500",
		},
		{
			items: report?.blue_ocean?.strategy?.reduce ?? [],
			icon: MinusCircle,
			title: "REDUCE",
			description: "Lower factors below the standard",
			iconColor: "text-purple-800",
		},
		{
			items: report?.blue_ocean?.strategy?.raise ?? [],
			icon: TrendingUp,
			title: "RAISE",
			description: "Improve factors above the standard",
			iconColor: "text-green-500",
		},
		{
			items: report?.blue_ocean?.strategy?.create ?? [],
			icon: PlusCircle,
			title: "CREATE",
			description: "Introduce new factors",
			iconColor: "text-indigo-600",
		},
	];

	if (loading) {
		return (
			<div className="min-w-0 xl:col-span-2">
				<SectionTitle icon={Megaphone}>
					Strategic Analysis
				</SectionTitle>
				<div className="p-4 text-sm text-muted-foreground">
					Loading strategic analysis...
				</div>
			</div>
		);
	}

	return (
		<div className="min-w-0 xl:col-span-2">
			<SectionTitle icon={Megaphone}>
				<span>Strategic Analysis</span>
			</SectionTitle>
			<div className="divide-y">
				<div className="flex w-full min-w-0 justify-center">
					<div className="grid w-full min-w-0 grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
						<button
							type="button"
							onClick={() => setActiveCard(1)}
							aria-pressed={activeCard === 1}
							className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:text-sm ${activeCard === 1
								? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-white"
								: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
								}`}
						>
							<Target className="size-4 shrink-0" />
							<span className="truncate">SWOT</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveCard(2)}
							aria-pressed={activeCard === 2}
							className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:text-sm ${activeCard === 2
								? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-white"
								: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
								}`}
						>
							<Waves className="size-4 shrink-0" />
							<span className="truncate">Blue Ocean</span>
						</button>
					</div>
				</div>

				<div
					className={`w-full min-w-0 grid-cols-1 gap-4 p-2 py-4 lg:grid-cols-2 ${
						activeCard === 1 ? "grid" : "hidden"
					}`}
				>
					{swot.map((item) => (
						<Cards
							key={item.title}
							items={item.items}
							icon={item.icon}
							title={item.title}
							description={item.description}
							iconColor={item.iconColor}
						/>
					))}
				</div>

				<div
					className={`w-full min-w-0 grid-cols-1 gap-4 p-2 py-4 lg:grid-cols-2 ${
						activeCard === 2 ? "grid" : "hidden"
					}`}
				>
					{blueOcean.map((item) => (
						<Cards
							key={item.title}
							items={item.items}
							icon={item.icon}
							title={item.title}
							description={item.description}
							iconColor={item.iconColor}
						/>
					))}
				</div>
			</div>
		</div>
	);
}