"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function VisualizerCard({ report }) {
	const now = new Date();
	const year = now.getFullYear();
	const monthShort = now.toLocaleString("en-US", { month: "short" });
	const month = now.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

	const sentimentByDay = new Map();
	const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

	report?.result?.forEach((item) => {
		let dayNum: number;

		if (typeof item.day === "number") {
			dayNum = item.day;
		} else {
			const str = String(item.day).trim();
			const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
			const short = str.match(/^([A-Za-z]{3,})\.?\s+(\d{1,2})$/);

			if (iso) {
			if (Number(iso[1]) !== year || Number(iso[2]) - 1 !== month) return;
				dayNum = Number(iso[3]);
			} else if (short) {
			const m = MONTHS.indexOf(short[1].slice(0, 3).toLowerCase());
			if (m !== month) return; // skip other months
				dayNum = Number(short[2]);
			} else {
				dayNum = new Date(str).getDate();
			}
		}

		if (Number.isNaN(dayNum)) return;

		sentimentByDay.set(dayNum, item.sentiment_score);
	});

	const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
		day: i + 1,
		sentiment: sentimentByDay.get(i + 1) ?? null,
	}));


	const currentSentiment =
		[...chartData].reverse().find((d) => d.sentiment !== null)?.sentiment ?? 0;

	const isPositive = currentSentiment > 0;
	const isNegative = currentSentiment < 0;

	const color = isPositive
	? "text-green-500"
	: isNegative
		? "text-red-500"
		: "text-orange-400";

	const arrow = isPositive ? "↗" : isNegative ? "↘" : "→";

	const hasPoints = chartData.some(
		(d) => typeof d.sentiment === "number" && !Number.isNaN(d.sentiment)
	);

	return (
			<Card className="w-full min-w-0 shrink-0 h-[550px] rounded-none">
				<div className="pointer-events-none absolute -bottom-20 -left-20 max-h-[48px] rounded-full bg-slate-400/5 blur-3xl" />

				<CardHeader className="relative flex flex-row items-start border-b justify-between">

					<div>
						<CardTitle className="grid-cols-2 gap-2 gap text-base font-semibold text-slate-800 flex">
							<TrendingUp className="size-5 text-green-500" />
							VADER Sentiment Trend
						</CardTitle>

						<p className="mt-1 text-xs text-slate-400">
							{monthLabel} | +1.0 (Positive) to -1.0 (Negative)
						</p>
					</div>

					<div className="text-right">
						<p className={`text-lg font-bold ${color}`}>
							{isPositive ? "+" : ""}
							{currentSentiment.toFixed(2)} {arrow}
						</p>

						<p className="text-xs text-slate-400">
							Current Sentiment:{" "}
							<span className="font-medium text-garay-500">
								Positive
							</span>
						</p>
					</div>

				</CardHeader>

				<CardContent className="relative h-full pt-2">
					{!hasPoints && (
						<div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex h-[320px] flex-col items-center justify-center gap-2">
							<div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
								<TrendingUp className="size-6 text-slate-400" />
							</div>
							<p className="text-sm font-medium text-slate-600">
								No sentiment data yet
							</p>
							<p className="text-xs text-slate-400">
								Points will appear here as messages are analyzed
							</p>
						</div>
					)}

					<div className="w-full overflow-x-auto">
						<ChartContainer
							config={chartConfig}
							className="h-[400px] lg:h-[430px] w-full aspect-auto"
							style={{ minWidth: Math.max(daysInMonth * 40, 600) }}
						>
							<AreaChart
								accessibilityLayer
								data={chartData}
								margin={{
									top: 10,
									right: 0,
									left: 0,
									bottom: 0,
								}}
							>

								<defs>
									<linearGradient id="sentiment-area" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%"   stopColor="#ff8725" stopOpacity={0.45} />
										<stop offset="35%"  stopColor="#fc964d" stopOpacity={0.22} />
										<stop offset="70%"  stopColor="#fdba74" stopOpacity={0.08} />
										<stop offset="100%" stopColor="#ffe9c9" stopOpacity={0} />
									</linearGradient>

									<linearGradient id="sentiment-line" x1="0" y1="0" x2="1" y2="0">
										<stop offset="0%"   stopColor="#fde68a" />
										<stop offset="25%"  stopColor="#fbbf24" />
										<stop offset="55%"  stopColor="#ffaa3b" />
										<stop offset="80%"  stopColor="#fc8b1a" />
										<stop offset="100%" stopColor="#dd7d00" />
									</linearGradient>

								</defs>

								<CartesianGrid
									vertical={false}
									strokeDasharray="3 3"
									className="opacity-10"
								/>

								<XAxis
									dataKey="day"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									interval={0}
									padding={{ left: 20, right: 20 }}
									tick={{ fontSize: 10, fill: "#585755" }}
									tickFormatter={(day) => `${monthShort} ${day}`}
								/>

								<YAxis
									domain={[-1, 1]}
									ticks={[-1, -0.5, 0, 0.5, 1]}
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tick={{
										fontSize: 10,
										fill: "#585755",
									}}
									tickFormatter={(value) =>
										value > 0 ? `+${value}` : value
									}
								/>

								<ChartTooltip
									cursor={false}
									content={
										<ChartTooltipContent
											indicator="line"
											labelFormatter={(_, payload) => {
												const day = payload?.[0]?.payload?.day;
												return day ? `${monthShort} ${day}, ${year}` : "";
											}}
										/>
									}
								/>

								<Area
									type="natural"
									dataKey="sentiment"
									connectNulls
									stroke="url(#sentiment-line)"
									strokeWidth={3}
									strokeLinecap="round"
									strokeLinejoin="round"
									fill="url(#sentiment-area)"
									style={{ filter: "url(#line-glow)" }}
									dot={{ r: 4, fill: "#ff951c", stroke: "#ffc392", strokeWidth: 2 }}
									activeDot={{ r: 7, fill: "#ffffff", stroke: "#ea8a0c", strokeWidth: 2 }}
								/>

							</AreaChart>
						</ChartContainer>
					</div>

				</CardContent>
			</Card>
	);
}
