
import { VisualizerCard } from "../visualizer-card";

import { useReportById } from "@/hooks/useReportById";
import { use } from "react";


export default function RevenueOverview({ params }: { params: Promise<{ "uuid-user": string }>}) {
    const { "uuid-user": id } = use(params);
    const { report, loading, error } = useReportById(id);

    return (
        
        <section className=" min-w-0  overflow-hidden border ">
                <VisualizerCard report={report} />
        </section>
    )
}



