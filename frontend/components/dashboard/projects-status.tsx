import { Loader2, LucideIcon } from "lucide-react";

export function	Status({icon: Icon, action, iconColor, num}: {icon: LucideIcon, action: string, iconColor: string, num: number}){
	return (
		<div className="job-status-card flex group h-full w-full border justify-between">
			<div className="job-status-label">
				<p className="job-status-label-text text-base py-2">{action}</p>
				<p className="text-2xl font-bold py-2">{num}</p>
			</div>
			<div className="job-status-icon-box rounded-lg p-2 border border-slate-300">
				<Icon className={`h-6 w-6 min-w-0 ${iconColor}`} />
			</div>
		</div>
	)
}