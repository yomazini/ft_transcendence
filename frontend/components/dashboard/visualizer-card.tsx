"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ReportDetails } from "@/app/types/report";

type ChartType = "area" | "line" | "bar";
type DateRange = "7" | "all" | "custom";
type SentimentFilter = "all" | "positive" | "negative" | "neutral";

type ChartPoint = {
	date: string;
	sentiment: number | null;
};

const chartConfig = {
	sentiment: {
		label: "VADER Sentiment",
		color: "#F97316",
	},
};

function formatDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");

	return `${y}-${m}-${d}`;
}

function getItemDate(day: string | number): string | null {
	const value = String(day).trim();

	const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);

	if (isoMatch) {
		const date = new Date(`${isoMatch[1]}T12:00:00`);

		if (Number.isNaN(date.getTime()) || formatDate(date) !== isoMatch[1]) {
			return null;
		}

		return isoMatch[1];
	}

	return null;
}

export function VisualizerCard({ report }: { report: ReportDetails | null }) {
	const [chartType, setChartType] = useState<ChartType>("area");

	const [dateRange, setDateRange] = useState<DateRange>("all");

	const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");

	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");

	const today = formatDate(new Date());
	const invalidRange = Boolean(from && to && from > to);

	const chartData = useMemo(() => {
		const now = new Date(`${today}T12:00:00`);
		const grouped = new Map<string, { total: number }>();

		report?.result?.forEach((item) => {
			const date = getItemDate(item.day);

			if (item.sentiment_score == null) {
				return;
			}

			const score = Number(item.sentiment_score);

			if (!date || !Number.isFinite(score) || score < -1 || score > 1) {
				return;
			}

			if (sentimentFilter === "positive" && score <= 0.05) {
				return;
			}

			if (sentimentFilter === "negative" && score >= -0.05) {
				return;
			}

			if (sentimentFilter === "neutral" && Math.abs(score) > 0.05) {
				return;
			}

			grouped.set(date, {
				total: score,
			});
		});

		const points: ChartPoint[] = Array.from(
			grouped.entries(),
			([date, value]) => ({
				date,
				sentiment: value.total,
			}),
		).sort((a, b) => a.date.localeCompare(b.date));

		if (dateRange === "all") {
			const start = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			);

			start.setDate(start.getDate() - 27);

			const startDate = formatDate(start);

			const last30 = points.filter(
				(point) => point.date >= startDate && point.date <= today,
			);

			const days = new Map(
				last30.map((point) => [point.date, point.sentiment]),
			);

			const result: ChartPoint[] = [];

			for (let i = 0; i < 28; i++) {
				const date = new Date(start);
				date.setDate(start.getDate() + i);

				const key = formatDate(date);

				result.push({
					date: key,
					sentiment: days.get(key) ?? null,
				});
			}
			return result;
		}

		if (dateRange === "custom") {
			if (invalidRange) return [];
			return points.filter(
				(point) =>
					(!from || point.date >= from) && (!to || point.date <= to),
			);
		}

		const start = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);

		start.setDate(start.getDate() - 6);

		const startDate = formatDate(start);

		const last7 = points.filter(
			(point) => point.date >= startDate && point.date <= today,
		);

		const days = new Map(
			last7.map((point) => [point.date, point.sentiment]),
		);

		const result: ChartPoint[] = [];

		for (let i = 0; i < 7; i++) {
			const date = new Date(start);
			date.setDate(start.getDate() + i);

			const key = formatDate(date);

			result.push({
				date: key,
				sentiment: days.get(key) ?? null,
			});
		}

		return result;
	}, [report, dateRange, sentimentFilter, today, from, to, invalidRange]);

	const validPoints = chartData.filter((point) => point.sentiment !== null);

	const currentSentiment = validPoints.at(-1)?.sentiment ?? null;

	const isPositive = currentSentiment !== null && currentSentiment > 0.05;

	const isNegative = currentSentiment !== null && currentSentiment < -0.05;

	const color =
		currentSentiment === null
			? "text-gray-400"
			: isPositive
				? "text-green-500"
				: isNegative
					? "text-red-500"
					: "text-amber-500";

	const arrow = isPositive ? "↗" : isNegative ? "↘" : "→";

	const sentimentLabel =
		currentSentiment === null
			? "No data"
			: isPositive
				? "Positive"
				: isNegative
					? "Negative"
					: "Neutral";

	const hasPoints = validPoints.length > 0;

	const chartChildren = (
		<>
			<CartesianGrid
				vertical={false}
				strokeDasharray="3 3"
				className="opacity-20"
			/>

			<XAxis
				dataKey="date"
				tickLine={false}
				axisLine={false}
				tickMargin={8}
				minTickGap={20}
				tick={{ fontSize: 10, fill: "#9ca3af" }}
				tickFormatter={(date: string) =>
					new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
					})
				}
			/>

			<YAxis
				domain={[-1, 1]}
				ticks={[-1, -0.5, 0, 0.5, 1]}
				tickLine={false}
				axisLine={false}
				tick={{ fontSize: 10, fill: "#9ca3af" }}
				tickFormatter={(value: number) =>
					value > 0 ? `+${value}` : String(value)
				}
			/>

			<ChartTooltip
				content={
					<ChartTooltipContent
						indicator="line"
						labelFormatter={(label) => String(label)}
					/>
				}
			/>
		</>
	);

	function resetFilters() {
		setDateRange("all");
		setFrom("");
		setTo("");
		setSentimentFilter("all");
		setChartType("area");
	}

	return (
		<Card className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
			<CardHeader className="border-b">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<CardTitle className="flex items-center gap-2 text-base text-gray-800">
							<TrendingUp className="size-5 text-orange-500" />
							<span className=" text-zinc-900 dark:text-white">
								VADER Sentiment Trend
							</span>
						</CardTitle>

						<p className="mt-1 text-xs text-gray-400">
							+1.0 (Positive) to -1.0 (Negative)
						</p>
					</div>

					<div className="text-right">
						<p className={`text-lg font-bold ${color}`}>
							{currentSentiment === null
								? "—"
								: `${currentSentiment > 0 ? "+" : ""}${currentSentiment.toFixed(2)} ${arrow}`}
						</p>

						<p className="text-xs text-gray-400">
							Latest Sentiment:{" "}
							<span className="font-medium text-gray-500">
								{sentimentLabel}
							</span>
						</p>
					</div>
				</div>

				<div className="mt-4 flex w-full flex-wrap gap-2">
					<Select
						value={dateRange}
						onValueChange={(value) => {
							setDateRange(value as DateRange);
						}}
					>
						<SelectTrigger className="h-9 w-[calc(50%-0.25rem)] lg:w-auto">
							<SelectValue placeholder="Date range" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="7">Last 7 days</SelectItem>
							<SelectItem value="all">All time</SelectItem>
							<SelectItem value="custom">Custom range</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={sentimentFilter}
						onValueChange={(value) =>
							setSentimentFilter(value as SentimentFilter)
						}
					>
						<SelectTrigger className="h-9 w-[calc(50%-0.25rem)] lg:w-auto">
							<SelectValue placeholder="Sentiment" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All sentiments</SelectItem>
							<SelectItem value="positive">Positive</SelectItem>
							<SelectItem value="negative">Negative</SelectItem>
							<SelectItem value="neutral">Neutral</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={chartType}
						onValueChange={(value) =>
							setChartType(value as ChartType)
						}
					>
						<SelectTrigger className="h-9 w-[calc(50%-0.25rem)] lg:w-auto">
							<SelectValue placeholder="Chart type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="area">Area Chart</SelectItem>
							<SelectItem value="line">Line Chart</SelectItem>
							<SelectItem value="bar">Bar Chart</SelectItem>
						</SelectContent>
					</Select>

					<Button
						variant="ghost"
						size="sm"
						className="h-9 shrink-0"
						onClick={resetFilters}
					>
						Reset
					</Button>

					{dateRange === "custom" && (
						<Popover>
							<PopoverTrigger
								render={
									<Button
										variant="outline"
										size="sm"
										className="h-9 w-[calc(50%-0.25rem)] lg:w-auto"
									/>
								}
							>
								<CalendarDays className="size-4" />
								Select dates
							</PopoverTrigger>
							<PopoverContent
								align="end"
								side="bottom"
								className="z-50 w-[min(320px,calc(100vw-32px))] bg-popover text-popover-foreground"
							>
								<div className="flex flex-col gap-4 whitespace-normal">
									<p className="text-sm font-medium">
										Custom date range
									</p>
									<label className="flex flex-col gap-2 text-xs">
										From
										<input
											type="date"
											value={from}
											max={to || undefined}
											onChange={(e) =>
												setFrom(e.target.value)
											}
											className="h-9 w-full min-w-0 rounded-md border border-input bg-background text-foreground dark:[color-scheme:dark] px-3 text-sm"
										/>
									</label>
									<label className="flex flex-col gap-2 text-xs">
										To
										<input
											type="date"
											value={to}
											min={from || undefined}
											onChange={(e) =>
												setTo(e.target.value)
											}
											className="h-9 w-full min-w-0 rounded-md border border-input bg-background text-foreground dark:[color-scheme:dark] px-3 text-sm"
										/>
									</label>
									<Button
										className="w-full"
										size="sm"
										disabled={invalidRange || !from || !to}
									>
										Apply
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					)}
				</div>
			</CardHeader>

			<CardContent className="min-w-0 overflow-hidden pt-6">
				{!hasPoints ? (
					<div className="flex h-[350px] flex-col items-center justify-center gap-2">
						<div className="flex size-12 items-center justify-center rounded-full 
						bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
							<TrendingUp className="size-6 text-gray-400" />
						</div>

						<p className="text-sm font-medium text-gray-600">
							No sentiment data available
						</p>

						<p className="text-center text-xs text-gray-400">
							Try another date range or sentiment filter.
						</p>
					</div>
				) : (
					<ChartContainer
						config={chartConfig}
						className="aspect-auto h-[250px] w-full min-w-0 max-w-full sm:h-[350px]"
					>
						{chartType === "area" ? (
							<AreaChart
								data={chartData}
								accessibilityLayer
								margin={{
									top: 10,
									right: 10,
									left: 0,
									bottom: 10,
								}}
							>
								<defs>
									<linearGradient
										id="sentiment-area"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="#F97316"
											stopOpacity={0.5}
										/>
										<stop
											offset="100%"
											stopColor="#F59E0B"
											stopOpacity={0.05}
										/>
									</linearGradient>
								</defs>

								{chartChildren}

								<Area
									type="monotone"
									dataKey="sentiment"
									stroke="#F97316"
									strokeWidth={2}
									fill="url(#sentiment-area)"
									dot={{ r: 3 }}
									activeDot={{ r: 6 }}
									connectNulls={false}
								/>
							</AreaChart>
						) : chartType === "line" ? (
							<LineChart
								data={chartData}
								accessibilityLayer
								margin={{
									top: 10,
									right: 10,
									left: 0,
									bottom: 10,
								}}
							>
								{chartChildren}

								<Line
									type="linear"
									dataKey="sentiment"
									stroke="#F97316"
									strokeWidth={2.5}
									strokeDasharray="5 3"
									dot={{
										r: 4,
										fill: "#F97316",
										strokeWidth: 0,
									}}
									activeDot={{ r: 7 }}
									connectNulls={false}
								/>
							</LineChart>
						) : (
							<BarChart
								data={chartData}
								accessibilityLayer
								margin={{
									top: 10,
									right: 10,
									left: 0,
									bottom: 10,
								}}
							>
								{chartChildren}

								<Bar
									dataKey="sentiment"
									fill="#F97316"
									radius={3}
									maxBarSize={40}
								/>
							</BarChart>
						)}
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}