"use client";

import { useState } from "react";
import {
    createCheckout,
    updateSubscription,
    type Billing,
    type PaidPlan
} from "@/lib/api/billing";
import { PLANS } from "@/lib/billing/plans";
import { PlanCard } from "./PlanCard";
import { toast } from "sonner";

export default function AvailablePlans({ billinginfo }: { billinginfo: Billing | null }) {

    const [processingPlan, setProcessingPlan] = useState<PaidPlan | null>(null);

    if (!billinginfo) return null;

    async function handleCheckout(plan: PaidPlan) {
        if (processingPlan !== null) return;

        setProcessingPlan(plan);

        try {
            if (billinginfo?.status === "active") {
                const result = await updateSubscription(plan);
                toast.success(result.message);
                window.location.reload();
            } else {
                const checkout = await createCheckout(plan);

                if (!checkout.url) {
                    throw new Error("Checkout URL is missing.");
                }

                window.location.assign(checkout.url);
            }
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to change subscription."
            );
        } finally {
            setProcessingPlan(null);
        }
    }

    return (
        <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white pt-20">Available plans</h2>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Choose the right capacity for your organization.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
                {PLANS.map((plan) => {
                    console.log("plan is : ", billinginfo.plan);
                    console.log("plan id : ", plan.id);
                    const current = billinginfo.plan === plan.id;
                    const paid = plan.id !== "free";
                    const canCheckout = paid && !current;

                    return (
                        <PlanCard key={plan.id} plan={plan} current={current} canCheckout={canCheckout} processingPlan={processingPlan} onCheckout={handleCheckout} />
                    );
                })}
            </div>
        </section>
    )
}