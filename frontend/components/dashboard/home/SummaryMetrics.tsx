"use client";

import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { listJobs } from "@/lib/api/jobs";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock3, Loader2 } from "lucide-react"

function MetricCard({
    value,
    change,
    icon: Icon,
    color
}: {
    value: number;
    change: string;
    icon: React.ElementType;
    color: string
}) {
    return (
        <div className="min-w-0 p-4">
            <div className="flex  justify-between gap-3">
                <div className="">
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="text-xl font-semibold tracking-tight sm:text-2xl">
                            {value}
                        </span>
                        <Badge
                            variant="secondary"
                            className={`border-0 bg-teal-50 dark:bg-teal-950 ${color} `}
                        >
                            {/* text-teal-700 */}
                            Jobs
                        </Badge>
                    </div>

                    <Button variant="outline" size="sm" className={`mt-3 border-${color} text-${color}`}>
                        {change} <ArrowRight className="ml-1 size-3.5" />
                    </Button>
                </div>

                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border">
                    <Icon className="size-4" />
                </div>
            </div>


        </div>
    );
}

export default function SummaryMetrics() {
    // Real counts from the organization's jobs (same live list as the Jobs panel).
    const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: listJobs });
    const count = (status: string) => jobs.filter((job) => job.status === status).length;
    const jobStatus = [
        { status: "Running", icon: Loader2, iconColor: 'orange-500', number: count("running") },
        { status: "Done", icon: CheckCircle2, iconColor: 'green-500', number: count("done") },
        { status: "Queued", icon: Clock3, iconColor: 'purple-500', number: count("queued") },
    ]



    return (
        <section className="grid min-w-0 grid-cols-1 divide-y border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 lg:divide-x">

            {jobStatus.map((item, i) => (
                <MetricCard
                    key={i}
                    value={item.number}
                    change={item.status}
                    icon={item.icon} 
                    color={item.iconColor}/>
            ))}
        </section>

    )
}
