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
    color: string;
}) {
    return (
        <div className="w-full min-w-0 max-w-full p-4 bg-card">
            <div className="flex min-w-0 items-start justify-between gap-3">

                <div className="min-w-0 flex-1">
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                        <span className="text-xl font-semibold tracking-tight sm:text-2xl">
                            {value}
                        </span>

                        <Badge
                            variant="secondary"
                            className={`border-0 bg-teal-50 dark:bg-teal-950 ${color}`}
                        >
                            Jobs
                        </Badge>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 max-w-full"
                    >
                        <span className="truncate">{change}</span>
                        <ArrowRight className="ml-1 size-3.5 shrink-0" />
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
    const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: listJobs });
    const count = (status: string) => jobs.filter((job) => job.status === status).length;
    const jobStatus = [
        { status: "Running", icon: Loader2, iconColor: 'orange-500', number: count("running") },
        { status: "Done", icon: CheckCircle2, iconColor: 'green-500', number: count("done") },
        { status: "Queued", icon: Clock3, iconColor: 'purple-500', number: count("queued") },
    ]



    return (
        <section className="bg-card grid w-full min-w-0 max-w-full grid-cols-1 border divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3 lg:divide-x">
            {jobStatus.map((item, i) => (
                <MetricCard
                    key={i}
                    value={item.number}
                    change={item.status}
                    icon={item.icon}
                    color={item.iconColor} />
            ))}
        </section>

    )
}
