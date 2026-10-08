import { Loader2, LucideIcon } from "lucide-react";

export function	Status({icon: Icon, action, iconColor, num}: {icon: LucideIcon, action: string, iconColor: string, num: number}){
	return (
		<div className="job-status-card flex group w-[50%] h-full justify-between border-rounded">
			<div className="job-status-label">
				<p className="job-status-label-text">{action}</p>
				<p className="job-status-value">{num}</p>
			</div>
			<div className="job-status-icon-box rounded-lg p-2 border border-slate-300">
				<Icon className={`h-6 w-6 ${iconColor}`} />
			</div>
		</div>
	)
}