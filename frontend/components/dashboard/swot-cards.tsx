import {
	Card,
	CardContent,
	CardHeader,
} from "@/components/ui/card"
import { LucideIcon } from "lucide-react"


export function Cards({ items, icon: Icon, title, description, iconColor }: { items: any[] | string | null; icon: LucideIcon; title: string, description: string, iconColor: string }) {
	/** The AI can return a list of strings or of objects ({ point } / { action } / { text }): always show text. */
	const textOf = (item: any): string =>
		typeof item === 'string'
			? item
			: (item?.point ?? item?.action ?? item?.text ?? JSON.stringify(item));

	return (
		<Card className={`stat-card group flex flex-col`}> {/*$*/}

			<CardHeader className="relative flex flex-col">
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

			<CardContent className={`relative overflow-y-auto pr-3 ${typeof items === "string" ? "max-h-[300px]" : "h-[100px]"}`}>
				<ul>
					{
						items === null ? (
							<li className="text-xs text-muted-foreground">Nothing found for this job.</li>
						) : typeof items === "string" ? (
								<li key={items} className="stat-list-items group">
									<span className="stat-list-dot" />
									<span className="leading-relaxed">{items}</span>
								</li>
						) : items.length === 0 ? (
							<li className="text-xs text-muted-foreground">Nothing found for this job.</li>
						) : (
							items.map((item, index) => (
								<li key={`${title}-${index}`} className="stat-list-item group">
									<span className="stat-list-dot" />
									<span className="leading-relaxed">{textOf(item)}</span>
								</li>
							))
						)
					}
				</ul>
			</CardContent>
		</Card>
	)
}
