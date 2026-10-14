import { Button } from "@/components/ui/button";
import SectionTitle from "./SectionTitle";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, ArrowLeft, ArrowRight, ChevronDown, Globe, Link, Megaphone, MinusCircle, MoreHorizontal, PlusCircle, ShieldCheck, ShoppingBasket, Target, Trash2, TrendingUp, Users, Waves } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { use, Activity, useState } from "react";
import { useReportById } from "@/hooks/useReportById";
import { Cards } from "../swot-cards";
import ListUesrs from "./listUsers";



export default function Strategic({ params }: { params: Promise<{ "uuid-user": string }> }) {
    const { "uuid-user": id } = use(params);
    const [activeCard, setActiveCard] = useState(1)
    const { report, loading, error } = useReportById(id);

    function switchCard(card: number) {
        (card === 1 ? setActiveCard(2) : setActiveCard(1))
    }
    const swot = [
        { items: report?.swot.strengths, icon: ShieldCheck, title: 'STRENGTHS', description: 'Internal advantages', iconColor: 'text-green-500' },
        { items: report?.swot.weaknesses, icon: Link, title: 'WEAKNESSES', description: 'Internal limitations', iconColor: 'text-orange-500' },
        { items: report?.swot.opportunities, icon: TrendingUp, title: 'OPPORTUNITIES', description: 'External possibilities', iconColor: 'text-indigo-500' },
        { items: report?.swot.threats, icon: ShieldCheck, title: 'THREATS', description: 'Potential external risks', iconColor: 'text-red-500' },
    ]

    const errc = [
        { items: report?.blue_ocean.eliminate, icon: Trash2, title: 'ELIMINATE', description: 'Remove unnecessary factors', iconColor: 'text-red-500' },
        { items: report?.blue_ocean.reduce, icon: MinusCircle, title: 'REDUCE', description: 'Lower factors below the standard', iconColor: 'text-purple-800' },
        { items: report?.blue_ocean.raise, icon: TrendingUp, title: 'RAISE', description: 'Improve factors above the standard', iconColor: 'text-green-500' },
        { items: report?.blue_ocean.create, icon: PlusCircle, title: 'CREATE', description: 'Introduce new factors', iconColor: 'text-indigo-600' },
    ]
    const campaigns = [

        {
            name: "Google",
            users: "9.12k users",
            status: "Running",
            icon: Globe,
            color: "text-blue-600",
            badge: "bg-orange-50 text-orange-600",
        },
        {
            name: "Facebook",
            users: "6.98k users",
            status: "Stopped",
            icon: Users,
            color: "text-blue-600",
            badge: "bg-rose-50 text-rose-600",
        },
        {
            name: "X/Twitter",
            users: "8.92k users",
            status: "Stopped",
            icon: Activity,
            color: "text-neutral-900",
            badge: "bg-rose-50 text-rose-600",
        },
    ];


    return (
        <div className="min-w-0 xl:col-span-2  ">
            <SectionTitle icon={Megaphone}>Strategic Analysis</SectionTitle>


            <div className="divide-y">
                <div className="flex w-full min-w-0 justify-center">
                    <div className="grid w-full min-w-0  grid-cols-2 gap-2 rounded-lg bg-slate-100  ">
                        <button
                            type="button"
                            onClick={() => setActiveCard(1)}
                            className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${activeCard === 1
                                ? "bg-white text-black shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <Target className="size-4 shrink-0" />
                            <span className="min-w-0 truncate">SWOT</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveCard(2)}
                            className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${activeCard === 2
                                ? "bg-white text-black shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                                }`}
                        >
                            <Waves className="size-4 shrink-0" />
                            <span className="min-w-0 truncate">Blue Ocean</span>
                        </button>
                    </div>
                </div>
                <div className="grid w-full min-w-0 grid-cols-1 gap-4 py-4 lg:grid-cols-2 p-2">
                    {activeCard === 1
                        ? swot.map((item, i) => (
                            <Cards
                                key={i}
                                items={item.items}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                                iconColor={item.iconColor}

                            />
                        ))
                        : errc.map((item, i) => (
                            <Cards
                                key={i}
                                items={item.items}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                                iconColor={item.iconColor}
                            />
                        ))}
                </div>

            </div>
            
        </div>
    )
}


