
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

import type { ReportDetails } from "@/app/types/report";

const chartConfig = {
  sentiment: {
    label: "Sentiment",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function VisualizerCard({
  report,
}: {
  report: ReportDetails | null;
}) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthShort = now.toLocaleString("en-US", {
    month: "short",
  });

  const monthLabel = now.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // Map sentiment values to days
  const sentimentByDay = new Map<number, number>();

  report?.result?.forEach((item) => {
    let dayNum: number;

    if (typeof item.day === "number") {
      dayNum = item.day;
    } else {
      const dayString = String(item.day);

      const iso = dayString.match(
        /^(\d{4})-(\d{2})-(\d{2})/
      );

      if (iso) {
        if (
          Number(iso[1]) !== year ||
          Number(iso[2]) - 1 !== month
        ) {
          return;
        }

        dayNum = Number(iso[3]);
      } else {
        const date = new Date(item.day);

        if (
          Number.isNaN(date.getTime()) ||
          date.getFullYear() !== year ||
          date.getMonth() !== month
        ) {
          return;
        }

        dayNum = date.getDate();
      }
    }

    if (dayNum < 1 || dayNum > daysInMonth) {
      return;
    }

    sentimentByDay.set(
      dayNum,
      item.sentiment_score
    );
  });

  // Generate data for every day of the month
  const chartData = Array.from(
    { length: daysInMonth },
    (_, i) => ({
      day: i + 1,
      sentiment: sentimentByDay.get(i + 1) ?? null,
    })
  );

  const latestSentiment = [...chartData]
    .reverse()
    .find(
      (item) =>
        item.sentiment !== null &&
        Number.isFinite(item.sentiment)
    );

  const currentSentiment =
    latestSentiment?.sentiment ?? 0;

  const hasPoints = Boolean(latestSentiment);

  const isPositive = currentSentiment > 0;
  const isNegative = currentSentiment < 0;

  const sentimentLabel = !hasPoints
    ? "No data"
    : isPositive
      ? "Positive"
      : isNegative
        ? "Negative"
        : "Neutral";

  const color = isPositive
    ? "text-green-500"
    : isNegative
      ? "text-red-500"
      : "text-orange-400";

  const arrow = isPositive
    ? "↗"
    : isNegative
      ? "↘"
      : "→";

  // Fixed horizontal space per day
  const DAY_WIDTH = 50;

  const chartWidth = Math.max(
    daysInMonth * DAY_WIDTH,
    600
  );

  return (
    <Card
      className="
        relative
        flex
        h-[550px]
        w-full
        min-w-0
        shrink-0
        flex-col
        overflow-hidden
        rounded-none
      "
    >
      {/* Background decoration */}
      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -left-20
          size-40
          rounded-full
          bg-slate-400/5
          blur-3xl
        "
      />

      {/* Header */}
      <CardHeader
        className="
          relative
          flex
          shrink-0
          flex-row
          items-start
          justify-between
          gap-4
          border-b
        "
      >
        <div className="min-w-0">
          <CardTitle
            className="
              flex
              items-center
              gap-2
              text-base
              font-semibold
              text-gray-800
              dark:text-gray-200
            "
          >
            <TrendingUp className="size-5 shrink-0 text-gray-500" />
            VADER Sentiment Trend
          </CardTitle>

          <p className="mt-1 text-xs text-gray-400">
            {monthLabel} | +1.0 (Positive) to -1.0 (Negative)
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className={`text-lg font-bold ${color}`}>
            {isPositive ? "+" : ""}
            {currentSentiment.toFixed(2)} {arrow}
          </p>

          <p className="text-xs text-gray-400">
            Current Sentiment:{" "}
            <span className="font-medium text-gray-500 dark:text-gray-300">
              {sentimentLabel}
            </span>
          </p>
        </div>
      </CardHeader>

      {/* Chart content */}
      <CardContent
        className="
          relative
          min-h-0
          min-w-0
          flex-1
          overflow-hidden
          pt-2
        "
      >
        {/* Empty state */}
        {!hasPoints && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-10
              flex
              flex-col
              items-center
              justify-center
              gap-2
            "
          >
            <div
              className="
                flex
                size-12
                items-center
                justify-center
                rounded-full
                bg-gray-100
                dark:bg-gray-800
              "
            >
              <TrendingUp className="size-6 text-gray-400" />
            </div>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              No sentiment data yet
            </p>

            <p className="text-center text-xs text-gray-400">
              Points will appear here as messages are analyzed
            </p>
          </div>
        )}

        {/* Horizontal scrolling area */}
        <div
          className="
            h-full
            w-full
            min-w-0
            overflow-x-auto
            overflow-y-hidden
            pb-3
          "
        >
          {/* Fixed-width chart wrapper */}
          <div
            className="h-[400px] lg:h-[430px]"
            style={{
              width: `${chartWidth}px`,
            }}
          >
            <ChartContainer
              config={chartConfig}
              className="h-full w-full aspect-auto"
            >
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                {/* Gradients */}
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
                      stopColor="#64748b"
                      stopOpacity={0.16}
                    />

                    <stop
                      offset="100%"
                      stopColor="#64748b"
                      stopOpacity={0}
                    />
                  </linearGradient>

                  <linearGradient
                    id="sentiment-line"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="#cbd5e1"
                    />

                    <stop
                      offset="50%"
                      stopColor="#94a3b8"
                    />

                    <stop
                      offset="100%"
                      stopColor="#475569"
                    />
                  </linearGradient>
                </defs>

                {/* Grid */}
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="opacity-10"
                />

                {/* X Axis */}
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval={0}
                  minTickGap={0}
                  padding={{
                    left: 20,
                    right: 20,
                  }}
                  tick={{
                    fontSize: 10,
                    fill: "#6b7280",
                  }}
                  tickFormatter={(day) =>
                    `${monthShort} ${day}`
                  }
                />

                {/* Y Axis */}
                <YAxis
                  domain={[-1, 1]}
                  ticks={[
                    -1,
                    -0.5,
                    0,
                    0.5,
                    1,
                  ]}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{
                    fontSize: 10,
                    fill: "#9ca3af",
                  }}
                  tickFormatter={(value) =>
                    value > 0
                      ? `+${value}`
                      : `${value}`
                  }
                />

                {/* Tooltip */}
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_, payload) => {
                        const day =
                          payload?.[0]?.payload?.day;

                        return day
                          ? `${monthShort} ${day}, ${year}`
                          : "";
                      }}
                    />
                  }
                />

                {/* Sentiment area */}
                <Area
                  type="natural"
                  dataKey="sentiment"
                  connectNulls
                  stroke="url(#sentiment-line)"
                  strokeWidth={2.5}
                  fill="url(#sentiment-area)"
                  dot={{
                    r: 4,
                    fill: "#475569",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#334155",
                    stroke: "#ffffff",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}














// "use client";

// import {
//   Area,
//   AreaChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
// } from "recharts";

// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   type ChartConfig,
// } from "@/components/ui/chart";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { TrendingUp } from "lucide-react";

// import type { ReportDetails } from "@/app/types/report";

// const chartConfig = {
//   sentiment: {
//     label: "Sentiment",
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig;



// export function VisualizerCard({ report }: { report: ReportDetails | null }) {
// 	const now = new Date();
// 	const year = now.getFullYear();
// 	const monthShort = now.toLocaleString("en-US", { month: "short" });
// 	const month = now.getMonth();
// 	const daysInMonth = new Date(year, month + 1, 0).getDate();
// 	const monthLabel = now.toLocaleString("en-US", { month: "long", year: "numeric" });

// 	const sentimentByDay = new Map<number, number>();
// 	report?.result?.forEach((item) => {
// 		let dayNum;

// 		if (typeof item.day === "number") {
// 			dayNum = item.day;
// 		} else {
// 			const iso = String(item.day).match(/^(\d{4})-(\d{2})-(\d{2})/);
// 			if (iso) {
// 				if (Number(iso[1]) !== year || Number(iso[2]) - 1 !== month) return;
// 				dayNum = Number(iso[3]);
// 			} else {
// 				dayNum = new Date(item.day).getDate();
// 			}
// 		}

// 		sentimentByDay.set(dayNum, item.sentiment_score);
// 	});

// 	const chartData = Array.from({ length: daysInMonth }, (_, i) => ({
// 		day: i + 1,
// 		sentiment: sentimentByDay.get(i + 1) ?? null,
// 	}));

// 	const currentSentiment =
// 		[...chartData].reverse().find((d) => d.sentiment !== null)?.sentiment ?? 0;

// 	const isPositive = currentSentiment > 0;
// 	const isNegative = currentSentiment < 0;

// 	const color = isPositive
// 	? "text-green-500"
// 	: isNegative
// 		? "text-red-500"
// 		: "text-orange-400";

// 	const arrow = isPositive ? "↗" : isNegative ? "↘" : "→";

// 	const hasPoints = chartData.some(
// 		(d) => typeof d.sentiment === "number" && !Number.isNaN(d.sentiment)
// 	);

// 	return (
// 		<Card className="w-full min-w-0 shrink-0 h-[550px] rounded-none">
// 		<div className="pointer-events-none absolute -bottom-20 -left-20 max-h-[48px] rounded-full bg-slate-400/5 blur-3xl" />

// 		<CardHeader className="relative flex flex-row items-start border-b justify-between">

// 			<div>
// 			<CardTitle className="grid-cols-2 gap-2 gap text-base font-semibold text-gray-800 flex">
// 				<TrendingUp className="size-5 text-gray-500" />
// 				VADER Sentiment Trend
// 			</CardTitle>

// 			<p className="mt-1 text-xs text-gray-400">
// 				{monthLabel} | +1.0 (Positive) to -1.0 (Negative)
// 			</p>
// 			</div>

// 			<div className="text-right">
// 			<p className={`text-lg font-bold ${color}`}>
// 				{isPositive ? "+" : ""}
// 				{currentSentiment.toFixed(2)} {arrow}
// 			</p>

// 			<p className="text-xs text-gray-400">
// 				Current Sentiment:{" "}
// 				<span className="font-medium text-gray-500">
// 				Positive
// 				</span>
// 			</p>
// 			</div>

// 		</CardHeader>

// 		<CardContent className="relative h-full pt-2">
// 			{!hasPoints && (
// 			<div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex h-[320px] flex-col items-center justify-center gap-2">
// 				<div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
// 				<TrendingUp className="size-6 text-gray-400" />
// 				</div>
// 				<p className="text-sm font-medium text-gray-600">
// 				No sentiment data yet
// 				</p>
// 				<p className="text-xs text-gray-400">
// 				Points will appear here as messages are analyzed
// 				</p>
// 			</div>
// 			)}

// 			<div className="w-full overflow-x-auto">
// 			<ChartContainer
// 				config={chartConfig}
// 				className="h-[400px] lg:h-[430px] w-full aspect-auto"
// 				style={{ minWidth: Math.max(daysInMonth * 40, 600) }}
// 			>
// 				<AreaChart
// 				accessibilityLayer
// 				data={chartData}
// 				margin={{
// 					top: 10,
// 					right: 0,
// 					left: 0,
// 					bottom: 0,
// 				}}
// 				>

// 				<defs>
// 					<linearGradient
// 					id="sentiment-area"
// 					x1="0"
// 					y1="0"
// 					x2="0"
// 					y2="1"
// 					>
// 					<stop
// 						offset="0%"
// 						stopColor="#64748b"
// 						stopOpacity={0.16}
// 					/>

// 					<stop
// 						offset="100%"
// 						stopOpacity={0}
// 					/>
// 					</linearGradient>

// 					<linearGradient
// 					id="sentiment-line"
// 					x1="0"
// 					y1="0"
// 					x2="1"
// 					y2="0"
// 					>
// 					<stop
// 						offset="0%"
// 						stopColor="#cbd5e1"
// 					/>

// 					<stop
// 						offset="50%"
// 						stopColor="#94a3b8"
// 					/>

// 					<stop
// 						offset="100%"
// 						stopColor="#475569"
// 					/>
// 					</linearGradient>

// 				</defs>

// 				<CartesianGrid
// 					vertical={false}
// 					strokeDasharray="3 3"
// 					className="opacity-10"
// 				/>

// 				<XAxis
// 					dataKey="day"
// 					tickLine={false}
// 					axisLine={false}
// 					tickMargin={8}
// 					interval={0}
// 					padding={{ left: 20, right: 20 }}
// 					tick={{ fontSize: 10, fill: "#6b7280" }}
// 					tickFormatter={(day) => `${monthShort} ${day}`}
// 				/>

// 				<YAxis
// 					domain={[-1, 1]}
// 					ticks={[-1, -0.5, 0, 0.5, 1]}
// 					tickLine={false}
// 					axisLine={false}
// 					tickMargin={8}
// 					tick={{
// 					fontSize: 10,
// 					fill: "#9ca3af",
// 					}}
// 					tickFormatter={(value) =>
// 					value > 0 ? `+${value}` : value
// 					}
// 				/>

// 				<ChartTooltip
// 					cursor={false}
// 					content={
// 					<ChartTooltipContent
// 						indicator="line"
// 						labelFormatter={(_, payload) => {
// 						const day = payload?.[0]?.payload?.day;
// 						return day ? `${monthShort} ${day}, ${year}` : "";
// 						}}
// 					/>
// 					}
// 				/>

// 				<Area
// 					type="natural"
// 					dataKey="sentiment"
// 					connectNulls
// 					stroke="url(#sentiment-line)"
// 					strokeWidth={2.5}
// 					fill="url(#sentiment-area)"
// 					dot={{ r: 4, fill: "#475569", stroke: "#ffffff", strokeWidth: 2 }}
// 					activeDot={{ r: 6, fill: "#334155", stroke: "#ffffff", strokeWidth: 2 }}
// 				/>

// 				</AreaChart>
// 			</ChartContainer>
// 			</div>

// 		</CardContent>
// 		</Card>
// 	);
// }
