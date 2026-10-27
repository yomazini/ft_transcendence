
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
import { useReportById } from "@/hooks/useReportById";
import { useSelectedJobId } from "@/hooks/useSelectedJob";
import { Cards } from "../swot-cards";

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

export default function Strategic() {
	const id = useSelectedJobId();

	const [activeCard, setActiveCard] =
		useState<1 | 2 | 3 | 4 | 5>(1);

	const { report, loading, error } = useReportById(id);

	const hasConclusion = report?.conclusion != null;

	const selectedCard =
		activeCard === 3 && !hasConclusion
			? 1
			: activeCard;

	// Blue Ocean strategy data
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
			iconColor: "text-gray-500",
		},
	];

	if (loading || error) {
		return (
			<div className="w-full min-w-0 self-start 2xl:col-span-2">
				<SectionTitle icon={Megaphone}>
					Strategic Analysis
				</SectionTitle>

				<div className="p-4 text-sm text-muted-foreground">
					{loading
						? "Loading strategic analysis..."
						: "Failed to load strategic analysis."}
				</div>
			</div>
		);
	}

	const activeItems = selectedCard === 1 ? swot : blueOcean;

	return (
		<div className="flex h-auto w-full min-w-0 max-w-full flex-col self-start 2xl:col-span-2">

			<SectionTitle icon={Megaphone}>
				<span>Strategic Analysis</span>
			</SectionTitle>

			<div className="flex w-full min-w-0 flex-col divide-y">

				<div className="w-full min-w-0">
					<div
						className={`grid w-full min-w-0 rounded-lg bg-slate-100 p-1 dark:bg-slate-900 ${hasConclusion
							? "grid-cols-3 gap-2"
							: "grid-cols-2 gap-2"
							}`}
					>
						<button
							type="button"
							onClick={() => setActiveCard(1)}
							aria-pressed={selectedCard === 1}
							className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${selectedCard === 1
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
							className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${selectedCard === 2
								? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-white"
								: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
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
								className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${selectedCard === 3
									? "bg-white text-black shadow-sm dark:bg-slate-800 dark:text-white"
									: "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
									}`}
							>
								<Lightbulb className="size-4 shrink-0" />
								<span className="truncate">Conclusion</span>
							</button>
						)}
					</div>
				</div>

				{selectedCard !== 3 && (
					<div className="grid h-auto w-full min-w-0 grid-cols-1 gap-4 px-2 py-4 sm:grid-cols-2 lg:min-h-[548px]">
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
					<div className="h-[548px] grid w-full min-w-0 grid-cols-1 gap-4 px-2 py-4">
						<Cards
							items={report?.conclusion ?? null}
							icon={Lightbulb}
							title="CONCLUSION"
							description="Key insights and final takeaways from the analysis."
							iconColor="text-gray-500"
						/>
					</div>
				)}

			</div>
		</div>
	);
}
