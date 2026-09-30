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
	report?.result?.forEach((item) => {
		let dayNum;

		if (typeof item.day === "number") {
			dayNum = item.day;
		} else {
			const iso = String(item.day).match(/^(\d{4})-(\d{2})-(\d{2})/);
			if (iso) {
				if (Number(iso[1]) !== year || Number(iso[2]) - 1 !== month) return;
				dayNum = Number(iso[3]);
			} else {
				dayNum = new Date(item.day).getDate();
			}
		}

		sentimentByDay.set(dayNum, item.sentiment_score);
	});

	const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
		day: i + 1,
		sentiment: sentimentByDay.get(i + 1) ?? null,
	}));

	const currentSentiment =
		[...chartData].reverse().find((d) => d.sentiment !== null)?.sentiment ?? 0;


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
				<div className="pointer-events-none absolute -bottom-20 -left-20 max-h-[48px] rounded-full bg-slate-400/5 blur-3xl" />

				{/* Header */}
				<CardHeader className="relative flex flex-row items-start justify-between pb-2">

					<div>
						<CardTitle className="text-base font-semibold text-slate-800">
							VADER Sentiment Trend
						</CardTitle>

						<p className="mt-1 text-xs text-slate-400">
							{monthLabel} | +1.0 (Positive) to -1.0 (Negative)
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

					<div className="w-full overflow-x-auto">
						<ChartContainer
							config={chartConfig}
							className="h-[240px]"
							style={{ width: Math.max(daysInMonth * 40, 600) }}
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
									interval={0}
									tick={{ fontSize: 10, fill: "#8e9195" }}
									tickFormatter={(day) => `${monthShort} ${day}`}
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
											labelFormatter={(_, payload) => {
												const day = payload?.[0]?.payload?.day;
												return day ? `${monthShort} ${day}, ${year}` : "";
											}}
										/>
									}
								/>

								{/* Area */}
								<Area
									type="natural"
									dataKey="sentiment"
									connectNulls            // draw the line across days with no data
									stroke="url(#sentiment-line)"
									strokeWidth={2.5}
									fill="url(#sentiment-area)"
									dot={{ r: 4, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
									activeDot={{ r: 6, fill: "#f97316", stroke: "#ffffff", strokeWidth: 2 }}
								/>

							</AreaChart>
						</ChartContainer>
					</div>

				</CardContent>
			</Card>
	);
}
