
import { ReportDetails } from "@/app/types/report";
import { AlertTriangle } from "lucide-react";

export function FeaturesCard({ report } : { report : ReportDetails | null}) {
	return (
		<div className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
						Features
					</span>

					<p className="mt-1.5 text-sm leading-5 text-zinc-600 dark:text-zinc-400">
						Product improvement suggestions
					</p>
				</div>
			</div>

			<div className="divide-y divide-zinc-100 dark:divide-white/10">
				{(report?.blue_ocean?.features ?? []).map((feature, index) => {

					return (
						<div key={feature.name} className="flex gap-4 py-5 first:pt-0 last:pb-0">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-sm font-semibold text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
								{index + 1}
							</div>

							<div className="min-w-0 flex-1 space-y-2">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
										{feature.name}
									</h4>

									<span
										className={`rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium capitalize text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300`}
									>
										{feature.priority}
									</span>
								</div>

								<p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
									{feature.justification}
								</p>
							</div>
						</div>

					);
				})}
				{report?.blue_ocean?.weakest_suggestion && (
					<div className="mt-5 pt-4">
						<div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
							<div className="mb-2 flex items-center gap-2">
								<span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
									Weakest Suggestion
								</span>
							</div>

							<p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-400">
								{report.blue_ocean.weakest_suggestion}
							</p>
						</div>
					</div>
				)}
			</div>

			{!report?.blue_ocean?.features?.length && (
				<p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-500 dark:border-white/10 dark:bg-zinc-800/40 dark:text-zinc-400">
					No recommended features available.
				</p>
			)}
		</div>
	)
}
