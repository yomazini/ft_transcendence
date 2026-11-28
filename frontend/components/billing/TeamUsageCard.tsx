import { type Billing } from "@/lib/api/billing";
import { Users } from "lucide-react";


export default function TeamUsageCard({ billinginfo }: { billinginfo: Billing | null }) {

    if (!billinginfo) return null

    const usagePercentage = Math.min(
        100,
        Math.round(
            (billinginfo.member_count / billinginfo.max_users) * 100,
        ),
    );

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
            <div className="flex items-center gap-2">
                <Users className="size-5 text-orange-600 dark:text-orange-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-white"> Team usage</h2>
            </div>
            <p className="mt-7 text-3xl font-semibold text-zinc-900 dark:text-white">
                {billinginfo.member_count}
                <span className="text-base font-normal text-zinc-700 dark:text-zinc-300"> / {billinginfo.max_users} members</span>
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 transition-all" style={{ width: `${usagePercentage}%` }} />
            </div>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                {Math.max(0, billinginfo.max_users - billinginfo.member_count)} seats available on your current plan.
            </p>
        </div>
    )
}



