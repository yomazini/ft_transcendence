"use client";

import { useState } from "react";
import { type Billing, deleteSubscription } from "@/lib/api/billing";
import { formatAmount, formatDate } from "@/lib/billing/utils";
import { CalendarDays, Crown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";

export default function CurrentPlanCard({
    billinginfo,
    onCancelledPlan
}: {
    billinginfo: Billing | null;
    onCancelledPlan: () => Promise<void>;
}) {
    const [canceling, setCanceling] = useState(false);

    if (!billinginfo) return null;

    async function handleCancel() {
        if (!window.confirm("Cancel your subscription immediately?")) {
            return;
        }

        setCanceling(true);

        try {
            const result = await deleteSubscription();
            await onCancelledPlan();
            toast.success(result.message);
        } catch (err) {
            toast.error(
                            err instanceof Error
                                ? err.message
                                : "Unable to cancel subscription."
                        );
        } finally {
            setCanceling(false);
        }
    }

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                    Current plan
                </h2>
                <StatusBadge status={billinginfo.status} />
            </div>

            <div className="mt-6 flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    <Crown className="size-6" />
                </div>

                <div>
                    <p className="text-2xl font-semibold capitalize text-zinc-900 dark:text-white">
                        {billinginfo.plan}
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {formatAmount(billinginfo.price_cents, "USD")} / month
                    </p>
                </div>
            </div>

            {billinginfo.subscription_end && (
                <div className="mt-6 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <CalendarDays className="size-4" />
                    Access until {formatDate(billinginfo.subscription_end)}
                </div>
            )}

            {billinginfo.status === "Active" && (
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={canceling}
                    className="mt-5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-zinc-800"
                >
                    {canceling ? "Canceling..." : "Cancel subscription"}
                </button>
            )}
        </div>
    );
}