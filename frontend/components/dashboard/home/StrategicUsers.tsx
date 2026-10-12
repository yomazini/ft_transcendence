import { useState } from "react";
import ListUesrs from "./listUsers";
import Strategic from "./Strategic";
import { Target, Waves } from "lucide-react";



export default function StrategicUsers({ params }: { params: Promise<{ "uuid-user": string }> }) {

    const [activeCard, setActiveCard] = useState(1)

    function switchCard(card: number) {
        (card === 1 ? setActiveCard(2) : setActiveCard(1))
    }

    // grid min-w-0 grid-cols-1 overflow-hidden border xl:grid-cols-3

    return (
        <section className="border">
            <div className="grid w-full min-w-0  grid-cols-2 gap-2  bg-slate-100  ">
                <button
                    type="button"
                    onClick={() => setActiveCard(1)}
                    className={`flex min-w-0 items-center justify-center gap-1  px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${activeCard === 1
                        ? "bg-white text-black shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                >
                    <Target className="size-4 shrink-0" />
                    <span className="min-w-0 truncate">SWOTs</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveCard(2)}
                    className={`flex min-w-0 items-center justify-center gap-1  px-2 py-2 text-xs transition-colors duration-200 sm:gap-2 sm:text-sm ${activeCard === 2
                        ? "bg-white text-black shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                        }`}
                >
                    <Waves className="size-4 shrink-0" />
                    <span className="min-w-0 truncate">Users</span>
                </button>
            </div>
            {
                activeCard === 1 ?
                    <Strategic params={params} /> :
                    <ListUesrs />
            }
            {/* </div> */}
        </section>
    )
}
