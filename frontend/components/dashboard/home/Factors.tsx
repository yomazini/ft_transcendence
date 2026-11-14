
import { Progress } from "@/components/ui/progress";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { ReportDetails } from "@/app/types/report";

export function FactorsCard({ report } : { report: ReportDetails | null}) {
	return (
		<div className="min-w-0 rounded-2xl border border-zinc-200 bg-white shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60">
			<div className="flex flex-col gap-1.5 p-5 sm:p-6">
				<div className="flex items-center justify-between gap-3">
					<span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
						Satisfaction by Factor
					</span>

					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 dark:border-orange-500/20 dark:bg-orange-500/10">
						<ChartNoAxesColumnIncreasing className="size-5 text-orange-600 dark:text-orange-400" />
					</div>
				</div>

				<p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
					Satisfaction (%) and number of importance mentions
				</p>
			</div>

			<div className="space-y-6 p-5 pt-0 sm:p-6 sm:pt-0">
				{Object.entries(report?.blue_ocean?.factors ?? {}).map(
					([name, factor]) => {
						const percentage = Math.round(factor.satisfaction * 100);
						const hasData = factor.importance > 0;

						return (
							<div key={name} className="space-y-3">
								<div className="flex items-center justify-between gap-3">
									<div className="flex min-w-0 items-center gap-2">
										<span className="truncate text-sm font-medium capitalize text-zinc-800 dark:text-zinc-200">
											{name.replaceAll("_", " ")}:
										</span>

										<span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
											{factor.importance} mentions
										</span>
									</div>

									<span className="shrink-0 rounded-lg bg-orange-50 px-2.5 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
										{hasData ? `${percentage}%` : "N/A"}
									</span>
								</div>

								<Progress
									value={percentage}
									trackColor="bg-zinc-100 dark:bg-zinc-800"
									indicatorColor="bg-orange-500 dark:bg-orange-400"
								/>
							</div>
						);
					}
				)}

				{Object.keys(report?.blue_ocean?.factors ?? {}).length === 0 && (
					<p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-800/40 dark:text-zinc-400">
						No satisfaction data available.
					</p>
				)}
			</div>
		</div>
	)
}
