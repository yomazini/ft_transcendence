import { Button } from "@/components/ui/button"
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Lightbulb, Link, Link2, LucideIcon, ShieldCheck, TrendingUp, Zap } from "lucide-react"
import { Icon } from "next/dist/lib/metadata/types/metadata-types";


export function Cards({ items, icon: Icon, title, description, iconColor }: { items: string[]; icon: LucideIcon; title: string, description: string, iconColor: string }) {
	return (

		<Card className="stat-card group flex flex-col ">
			{/* Subtle orange glow */}
			{/* <div className="stat-card-glow " /> */}

			<CardHeader className="relative  flex flex-col  pb-3">
				<div className=" flex items-center justify-between w-full ">
					<div className="text-base font-semibold text-slate-800">
						{title}
					</div>
					{/* Icon */}

					<div className="stat-card-icon-box">
						<Icon className={`h-5 w-5 text-gray-500 ${iconColor}`} />
					</div>

				</div>

				<p className="truncate mt-1 text-xs text-slate-400 max-w-[150px]">
					{description}
				</p>
			</CardHeader>

			<CardContent className="relative max-h-[150px] overflow-y-auto pr-3">
				<ul>
					{/* {items.map((item) => (
						<li key={item} className="stat-list-item group">
							<span className="stat-list-dot" />
							<span className="leading-relaxed">{item}</span>
						</li>
					))} */}
				</ul>
			</CardContent>
		</Card>
	)
}
