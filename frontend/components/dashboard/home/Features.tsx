import { ReportDetails } from "@/app/types/report";
import { AlertTriangle } from "lucide-react";

export function FeaturesCard({ report } : { report : ReportDetails | null}) {
	return (
		<div className="w-full border p-5 bg-card">
			<div className="mb-5 flex items-center justify-between">
				<div>
					<span>Features</span>

					<p className="mt-1 text-xs text-slate-400">
						AI-generated product improvement suggestions
					</p>
				</div>
			</div>

			<div className="divide-y divide-slate-100">
				{(report?.blue_ocean?.features ?? []).map((feature, index) => {

					return (
						<div key={feature.name} className="flex gap-4 py-5 first:pt-0 last:pb-0">
							<div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-500">
								{index + 1}
							</div>

							<div className="min-w-0 flex-1 space-y-2">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<h4 className="text-sm font-semibold text-slate-800">
										{feature.name}
									</h4>

									<span
										className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize bg-gray-500`}
									>
										{feature.priority}
									</span>
								</div>

								<p className="text-sm leading-relaxed text-slate-500">
									{feature.justification}
								</p>
							</div>
						</div>

					);
				})}
				{report?.blue_ocean?.weakest_suggestion && (
					<div className="mt-5 pt-4">
						<div className="mb-2 flex items-center gap-2">
							<AlertTriangle className="size-4 text-amber-500" />

							<span className="text-sm font-semibold text-slate-700">
								Weakest Suggestion
							</span>
						</div>

						<p className="text-sm leading-relaxed text-slate-500">
							{report.blue_ocean.weakest_suggestion}
						</p>
					</div>
				)}
			</div>

			{!report?.blue_ocean?.features?.length && (
				<p className="py-8 text-center text-sm text-slate-400">
					No recommended features available.
				</p>
			)}
		</div>
	)
}