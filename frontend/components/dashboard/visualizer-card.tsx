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

const chartData = [
  { day: "Dec 13", sentiment: -0.2 },
  { day: "Nov 20", sentiment: 0.5 },
  { day: "Dec 31", sentiment: -0.1 },
  { day: "Dec 37", sentiment: 0.7 },
  { day: "Dec 29", sentiment: 0.25 },
  { day: "Today", sentiment: 0.75 },
];

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function VisualizerCard() {
  const currentSentiment =
    chartData[chartData.length - 1].sentiment;

  return (
		<Card
			className="
				stat-card
				group
			"
		>

			{/* Subtle orange glow */}
			<div className="stat-card-glow" />

			{/* Subtle gray glow */}
			<div className="pointer-events-none absolute -bottom-20 -left-20 max-h-[48px] max-w-[px] rounded-full bg-slate-400/5 blur-3xl" />

			{/* Header */}
			<CardHeader className="relative flex flex-row items-start justify-between pb-2">

				<div>
					<CardTitle className="text-base font-semibold text-slate-800">
						VADER Sentiment Trend
					</CardTitle>

					<p className="mt-1 text-xs text-slate-400">
						30-Day Sentiment | +1.0 (Positive) to -1.0 (Negative)
					</p>
				</div>

				{/* Current value */}
				<div className="text-right">
					<p className="text-lg font-bold text-orange-500">
						{currentSentiment > 0 ? "+" : ""}
						{currentSentiment.toFixed(2)} ↗
					</p>

					<p className="text-xs text-slate-400">
						Current Sentiment:{" "}
						<span className="font-medium text-orange-500">
							Positive
						</span>
					</p>
				</div>

			</CardHeader>

			{/* Chart */}
			<CardContent className="relative h-full pt-2">

				<ChartContainer
					config={chartConfig}
					className="h-full w-full"
				>
					<AreaChart
						accessibilityLayer
						data={chartData}
						margin={{
							top: 10,
							right: 12,
							left: 0,
							bottom: 0,
						}}
					>

						<defs>

							{/* Area gradient */}
							<linearGradient
								id="sentiment-area"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="#706a66"
									stopOpacity={0.16}
								/>

								<stop
									offset="100%"
									stopOpacity={0}
								/>
							</linearGradient>

							{/* Line gradient */}
							<linearGradient
								id="sentiment-line"
								x1="0"
								y1="0"
								x2="1"
								y2="0"
							>
								<stop
									offset="0%"
									stopColor="#f6d4b9"
								/>

								<stop
									offset="50%"
									stopColor="#fdab71"
								/>

								<stop
									offset="100%"
									stopColor="#fc5a03"
								/>
							</linearGradient>

						</defs>

						{/* Grid */}
						<CartesianGrid
							vertical={false}
							strokeDasharray="3 3"
							className="opacity-10"
						/>

						{/* X axis */}
						<XAxis
							dataKey="day"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tick={{
								fontSize: 10,
								fill: "#8e9195",
							}}
						/>

						{/* Y axis */}
						<YAxis
							domain={[-1, 1]}
							ticks={[-1, -0.5, 0, 0.5, 1]}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tick={{
								fontSize: 10,
								fill: "#94a3b8",
							}}
							tickFormatter={(value) =>
								value > 0 ? `+${value}` : value
							}
						/>

						{/* Tooltip */}
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									indicator="line"
								/>
							}
						/>

						{/* Area */}
						<Area
							type="natural"
							dataKey="sentiment"
							stroke="url(#sentiment-line)"
							strokeWidth={2.5}
							fill="url(#sentiment-area)"
							dot={{
								r: 4,
								fill: "#f97316",
								stroke: "#ffffff",
								strokeWidth: 2,
							}}
							activeDot={{
								r: 6,
								fill: "#f97316",
								stroke: "#ffffff",
								strokeWidth: 2,
							}}
						/>

					</AreaChart>
				</ChartContainer>

			</CardContent>
		</Card>
  );
}