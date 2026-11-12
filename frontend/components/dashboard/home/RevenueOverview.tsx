
import { ReportDetails } from "@/app/types/report";
import { VisualizerCard } from "../visualizer-card";

export default function RevenueOverview({ report }: { report: ReportDetails | null }) {
    return (
        
        <section className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
                <VisualizerCard report={report} />
        </section>
    )
}



