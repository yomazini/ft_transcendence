"use client";

import { useEffect, useState } from "react";
import {
	Activity,
	Globe,
	Lightbulb,
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

const asText = (v: unknown): string => {
	if (typeof v === "string") return v;
	if (v && typeof v === "object") {
		const o = v as { point?: string; action?: string; text?: string };
		return o.point ?? o.action ?? o.text ?? JSON.stringify(v);
	}
	return String(v ?? "");
};

const asItems = (v: unknown): string[] =>
	Array.isArray(v) ? v.map(asText) : typeof v === "string" ? [v] : [];




export default function Strategic() {
	const id = useSelectedJobId();
	const [activeCard, setActiveCard] = useState<1 | 2 | 3>(1);

	const { report, loading, error } = useReportById(id);
	const selectedCard = (activeCard === 3 && report?.conclusion === null) ? 1 : activeCard;

	// Analysis-svc stores the four actions under blue_ocean.strategy.
	// Keep the old top-level shape as a fallback.
	const blue = report?.blue_ocean as
		| { strategy?: Record<string, unknown>; [key: string]: unknown }
		| undefined;
	const strategy = blue?.strategy ?? blue;
	const swot = [
		{
			items: asItems(report?.swot?.strengths),
			icon: ShieldCheck,
			title: "STRENGTHS",
			description: "Internal advantages",
			iconColor: "text-gray-500",
		},
		{
			items: asItems(report?.swot?.weaknesses),
			icon: Link,
			title: "WEAKNESSES",
			description: "Internal limitations",
			iconColor: "text-gray-500",
		},
		{
			items: asItems(report?.swot?.opportunities),
			icon: TrendingUp,
			title: "OPPORTUNITIES",
			description: "External possibilities",
			iconColor: "text-gray-500",
		},
		{
			items: asItems(report?.swot?.threats),
			icon: ShieldCheck,
			title: "THREATS",
			description: "Potential external risks",
			iconColor: "text-gray-500",
		},
	];

	const blueOcean = [
		{
			items: asItems(strategy?.eliminate),
			icon: Trash2,
			title: "ELIMINATE",
			description: "Remove unnecessary factors",
			iconColor: "text-gray-500",
		},
		{
			items: asItems(strategy?.reduce),
			icon: MinusCircle,
			title: "REDUCE",
			description: "Lower factors below the standard",
			iconColor: "text-gray-500",
		},
		{
			items: asItems(strategy?.raise),
			icon: TrendingUp,
			title: "RAISE",
			description: "Improve factors above the standard",
			iconColor: "text-gray-500",
		},
		{
			items: asItems(strategy?.create),
			icon: PlusCircle,
			title: "CREATE",
			description: "Introduce new factors",
			iconColor: "text-gary-500",
		},
	];

	const conclusion = [
		{
			item: report?.conclusion ?? null,
			icon: Lightbulb,
			title: "conclusion",
			description: "Key insights and final takeaways from the analysis.",
			iconColor: "text-gray-500",
		}
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
			<div className="divide-y h-[500px]">
				<div className="flex w-full min-w-0 justify-center">
					<div className={`grid w-full min-w-0 rounded-lg bg-slate-100 p-1 dark:bg-slate-900
						${report?.conclusion !== null ? "grid-cols-3 gap-3" : "grid-cols-2 gap-2"}`}>
						<button
							type="button"
							onClick={() => setActiveCard(1)}
							aria-pressed={selectedCard === 1}
							className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:text-sm ${selectedCard === 1
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
							aria-pressed={selectedCard === 2}
							className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:text-sm ${selectedCard === 2
								? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-white"
								: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
								}`}
						>
							<Waves className="size-4 shrink-0" />
							<span className="truncate">Blue Ocean</span>
						</button>
						{
							(() => {
								if (report?.conclusion !== null) {
									return (
									<button
										type="button"
										onClick={() => setActiveCard(3)}
										className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:text-sm ${selectedCard === 3
											? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-white"
											: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
											}`}
									>
										<Lightbulb className="size-4" />
										<span>Conclusion</span>
									</button>
									);
								}
								return null;
							})()
						}
					</div>
				</div>

				<div
					className={`w-full min-w-0 grid-cols-1 gap-4 p-2 py-4 lg:grid-cols-2 ${
						selectedCard === 1 ? "grid" : "hidden"
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
						(selectedCard === 2) ? "grid" : "hidden"
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
				<div
					className={`w-full min-w-0 grid grid-cols-1 p-4 ${
						selectedCard === 3 ? "" : "hidden"
					}`}
				>
					{conclusion.map((item) => (
						<Cards
						key={item.title}
						items={item.item}
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