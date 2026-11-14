
"use client";

import { useState } from "react";

import {
	Lightbulb,
	Link,
	Megaphone,
	MinusCircle,
	PlusCircle,
	ShieldCheck,
	Target,
	Trash2,
	TrendingUp,
	Waves,
} from "lucide-react";

import SectionTitle from "./SectionTitle";
import { Cards } from "../swot-cards";
import { ReportDetails } from "@/app/types/report";

const asText = (value: unknown): string => {
	if (typeof value === "string") {
		return value;
	}

	if (value && typeof value === "object") {
		const item = value as {
			point?: string;
			action?: string;
			text?: string;
		};

		return (
			item.point ??
			item.action ??
			item.text ??
			JSON.stringify(value)
		);
	}

	return String(value ?? "");
};

const asItems = (value: unknown): string[] => {
	if (Array.isArray(value)) {
		return value.map(asText);
	}

	if (typeof value === "string") {
		return [value];
	}

	return [];
};

export default function Strategic({ report, loading } : {report : ReportDetails | null, loading : boolean}) {	
	const [activeCard, setActiveCard] =
		useState<1 | 2 | 3 | 4 | 5>(1);

	const hasConclusion = report?.conclusion != null;

	const selectedCard =
		activeCard === 3 && !hasConclusion
			? 1
			: activeCard;

	const blue = report?.blue_ocean as
		| {
			strategy?: Record<string, unknown>;
			[key: string]: unknown;
		}
		| undefined;

	const strategy = blue?.strategy ?? blue;

	const swot = [
		{
			items: asItems(report?.swot?.strengths),
			icon: ShieldCheck,
			title: "STRENGTHS",
			description: "Internal advantages",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
		{
			items: asItems(report?.swot?.weaknesses),
			icon: Link,
			title: "WEAKNESSES",
			description: "Internal limitations",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
		{
			items: asItems(report?.swot?.opportunities),
			icon: TrendingUp,
			title: "OPPORTUNITIES",
			description: "External possibilities",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
		{
			items: asItems(report?.swot?.threats),
			icon: ShieldCheck,
			title: "THREATS",
			description: "Potential external risks",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
	];

	const blueOcean = [
		{
			items: asItems(strategy?.eliminate),
			icon: Trash2,
			title: "ELIMINATE",
			description: "Remove unnecessary factors",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
		{
			items: asItems(strategy?.reduce),
			icon: MinusCircle,
			title: "REDUCE",
			description: "Lower factors below the standard",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
		{
			items: asItems(strategy?.raise),
			icon: TrendingUp,
			title: "RAISE",
			description: "Improve factors above the standard",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
		{
			items: asItems(strategy?.create),
			icon: PlusCircle,
			title: "CREATE",
			description: "Introduce new factors",
			iconColor: "text-orange-600 dark:text-orange-400",
		},
	];

	if (loading) {
		return (
			<div className="w-full min-w-0 self-start rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-6 2xl:col-span-2">
				<SectionTitle icon={Megaphone}>
					Strategic Analysis
				</SectionTitle>

				<div className="py-6 text-sm text-zinc-700 dark:text-zinc-200">
					{loading
						? "Loading strategic analysis..."
						: "Failed to load strategic analysis."}
				</div>
			</div>
		);
	}

	const activeItems = selectedCard === 1 ? swot : blueOcean;

	return (
		<div className="flex h-auto w-full min-w-0 max-w-full flex-col self-start rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6 2xl:col-span-2">

			<SectionTitle icon={Megaphone}>
				<span>Strategic Analysis</span>
			</SectionTitle>

			<div className="flex w-full min-w-0 flex-col">

				<div className="mt-5 w-full min-w-0">
					<div
						className={`grid w-full min-w-0 rounded-xl border border-orange-200 bg-orange-50/70 p-1.5 dark:border-orange-500/20 dark:bg-zinc-800/90 ${
							hasConclusion
								? "grid-cols-3 gap-1.5"
								: "grid-cols-2 gap-1.5"
						}`}
					>
						<button
							type="button"
							onClick={() => setActiveCard(1)}
							aria-pressed={selectedCard === 1}
							className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all duration-200 sm:gap-2 sm:text-sm ${
								selectedCard === 1
									? "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-500 dark:from-orange-500 dark:via-orange-400 dark:to-amber-500 dark:text-zinc-950 dark:ring-orange-400"
									: "text-zinc-800 hover:bg-white hover:text-orange-700 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-orange-300"
							}`}
						>
							<Target className="size-4 shrink-0" />
							<span className="truncate">SWOT</span>
						</button>

						<button
							type="button"
							onClick={() => setActiveCard(2)}
							aria-pressed={selectedCard === 2}
							className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all duration-200 sm:gap-2 sm:text-sm ${
								selectedCard === 2
									? "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-500 dark:from-orange-500 dark:via-orange-400 dark:to-amber-500 dark:text-zinc-950 dark:ring-orange-400"
									: "text-zinc-800 hover:bg-white hover:text-orange-700 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-orange-300"
							}`}
						>
							<Waves className="size-4 shrink-0" />
							<span className="truncate">Blue Ocean</span>
						</button>

						{hasConclusion && (
							<button
								type="button"
								onClick={() => setActiveCard(3)}
								aria-pressed={selectedCard === 3}
								className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition-all duration-200 sm:gap-2 sm:text-sm ${
									selectedCard === 3
										? "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 text-white shadow-md shadow-orange-500/20 ring-1 ring-orange-500 dark:from-orange-500 dark:via-orange-400 dark:to-amber-500 dark:text-zinc-950 dark:ring-orange-400"
										: "text-zinc-800 hover:bg-white hover:text-orange-700 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-orange-300"
								}`}
							>
								<Lightbulb className="size-4 shrink-0" />
								<span className="truncate">Conclusion</span>
							</button>
						)}
					</div>
				</div>

				{selectedCard !== 3 && (
					<div className="grid h-auto w-full min-w-0 grid-cols-1 gap-4 py-5 sm:grid-cols-2 lg:min-h-[548px]">
						{activeItems.map((item) => (
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
				)}

				{selectedCard === 3 && hasConclusion && (
					<div className="grid h-[548px] w-full min-w-0 grid-cols-1 gap-4 py-5">
						<Cards
							items={report?.conclusion ?? null}
							icon={Lightbulb}
							title="CONCLUSION"
							description="Key insights and final takeaways from the analysis."
							iconColor="text-orange-600 dark:text-orange-400"
						/>
					</div>
				)}

			</div>
		</div>
	);
}
