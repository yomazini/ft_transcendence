"use client";

import { Cards } from "@/components/dashboard/swot-cards";
import { VisualizerCard } from "@/components/dashboard/visualizer-card";
import { Link, MinusCircle, PlusCircle, ShieldCheck, Trash2, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";


const test = [
	"text1 dnkcwn cmew ,c w",
	"text2 ipsum dolor sit amet.",
	"text3  kfwkejnfkwefjkewnf",
	"text4  kfwkejnfkwefjkewnf",
];

const test2 = [
	"text5  kfwkejnfkwefjkewnf",
	"text6  kfwkejnfkwefjkewnf",
	"text7  kfwkejnfkwefjkewnf",
	"text8  kfwkejnfkwefjkewnf",
];

const swot = [
	{items: test, icon: ShieldCheck, title: 'STRENGTHS', description: 'Internal advantages'},
	{items: test, icon: Link, title: 'WEAKNESSES', description: 'Internal limitations'},
	{items: test, icon: TrendingUp, title: 'OPPORTUNITIES', description: 'External possibilities'},
	{items: test, icon: ShieldCheck, title: 'THREATS', description: 'Potential external risks'},
]

const errc = [
	{items: test2, icon: Trash2, title: 'ELIMINATE', description: 'Remove unnecessary factors'},
	{items: test2, icon: MinusCircle, title: 'REDUCE', description: 'Lower factors below the standard'},
	{items: test2, icon: TrendingUp, title: 'RAISE', description: 'Improve factors above the standard'},
	{items: test2, icon: PlusCircle, title: 'CREATE', description: 'Introduce new factors'},
]

export default function DashboardPage({ params}: { params: Promise<{ id: string }>})
{
	const [activeCard, setActiveCard] = useState(1)
	function switchCard(card : number) {
		(card === 1 ? setActiveCard(2) : setActiveCard(1))
	}
	return (
		<div className="space-y-6 h-screen w-scree">
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 max-h-screen h-full">
				<div className="w-full" >
					<VisualizerCard />

				</div>

				<div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{activeCard === 1 ? (
						swot.map((item, i) => (
						<Cards key={i} items={item.items} icon={item.icon} title={item.title} description={item.description} />
						))
					) : (
						errc.map((item, i) => (
						<Cards key={i} items={item.items} icon={item.icon} title={item.title} description={item.description} />
						))
					)}
					</div>

					<div className="mt-4 flex justify-end">
					<button
						onClick={() => switchCard(activeCard)}
						className="group btn-secondary"
					>
						<span className="h-2 w-2 rounded-full bg-orange-500 transition-transform duration-200 group-hover:scale-125" />
						{activeCard === 1 ? "SWOT" : "ERRC"}
					</button>
					</div>
				</div>
			</div>
		</div>
	)
}


