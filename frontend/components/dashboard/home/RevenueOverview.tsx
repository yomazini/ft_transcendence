
import { VisualizerCard } from "../visualizer-card";

import { useReportById } from "@/hooks/useReportById";
import { useSelectedJobId } from "@/hooks/useSelectedJob";


export default function RevenueOverview() {
    const id = useSelectedJobId();
    const { report, loading, error } = useReportById(id);

    return (
        
        <section className=" min-w-0  overflow-hidden border ">
                <VisualizerCard report={report} />
        </section>
    )
}



