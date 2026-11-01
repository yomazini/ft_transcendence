import { Progress } from "@/components/ui/progress";
import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { ReportDetails } from "@/app/types/report";

export function FactorsCard({ report } : { report: ReportDetails | null}) {
	return (
		<div className="rounded-2xl border shadow-sm rounded-none bg-card">
			<div className="flex flex-col gap-1.5 p-6">
				<div className="flex items-center justify-between gap-3">
					<span>Satisfaction by Factor</span>

					<div className="stat-card-icon-box shrink-0">
						<ChartNoAxesColumnIncreasing className="size-5 text-slate-500" />
					</div>
				</div>

				<p className="mt-1 text-xs text-slate-400">
					Satisfaction (%) and number of importance mentions
				</p>
			</div>

			<div className="space-y-5 p-6 pt-0">
				{Object.entries(report?.blue_ocean?.factors ?? {}).map(
					([name, factor]) => {
						const percentage = Math.round(factor.satisfaction * 100);
						const hasData = factor.importance > 0;

						return (
							<div key={name} className="space-y-2">
								<div className="flex items-center justify-between gap-3">
									<div className="flex min-w-0 items-center gap-2">
										<span className="truncate text-sm font-medium capitalize text-slate-700">
											{name.replaceAll("_", " ")}:
										</span>

										{factor.importance} mentions
									</div>

									<span className="shrink-0 text-sm font-semibold text-slate-700">
										{hasData ? `${percentage}%` : "N/A"}
									</span>
								</div>

								<Progress
									value={percentage}
									trackColor="bg-slate-800"
									indicatorColor="bg-slate-400"
								/>
							</div>
						);
					}
				)}
				{Object.keys(report?.blue_ocean?.factors ?? {}).length === 0 && (
					<p className="py-8 text-center text-sm text-slate-400">
						No satisfaction data available.
					</p>
				)}
			</div>
		</div>
	)
}