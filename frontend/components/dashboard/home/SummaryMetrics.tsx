
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
        <div className="w-full min-w-0 max-w-full rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors dark:border-white/10 dark:bg-zinc-900/60 sm:p-6">
            <div className="flex min-w-0 items-start justify-between gap-3">

                <div className="min-w-0 flex-1">
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
                        <span className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                            {value}
                        </span>

                        <Badge
                            variant="secondary"
                            className={`rounded-lg border-0 bg-violet-50 px-2.5 py-1 text-xs font-medium dark:bg-violet-500/10 ${color}`}
                        >
                            Jobs
                        </Badge>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 max-w-full rounded-xl border-zinc-200 bg-zinc-50 px-3 text-zinc-600 shadow-none transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
                    >
                        <span className="truncate">{change}</span>
                        <ArrowRight className="ml-1 size-3.5 shrink-0" />
                    </Button>
                </div>

                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                    <Icon className="size-5" />
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
        <section className="grid w-full min-w-0 max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
