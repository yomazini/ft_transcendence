
import { ReportDetails } from "@/app/types/report";
import { VisualizerCard } from "../visualizer-card";

export default function RevenueOverview({ report }: { report: ReportDetails | null }) {
    return (
        
        <section className="border bg-card">
                <VisualizerCard report={report} />
        </section>
    )
}



