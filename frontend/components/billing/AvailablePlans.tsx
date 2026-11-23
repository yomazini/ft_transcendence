"use client";

import { useState } from "react";
import { createCheckout, type Billing, type PaidPlan } from "@/lib/api/billing";
import { PLANS } from "@/lib/billing/plans";
import { PlanCard } from "./PlanCard";
import { toast } from "sonner";

export default function AvailablePlans({ billinginfo }: { billinginfo: Billing | null }) {

    const [processingPlan, setProcessingPlan] = useState<PaidPlan | null>(null);

    if (!billinginfo) return null;

    async function handleCheckout(plan: PaidPlan) {
        if (processingPlan !== null) return;

        if (billinginfo?.status === "active") {
            toast.error(
                "An active subscription already exists. Plan switching is not available yet.",
            );
            return;
        }
        setProcessingPlan(plan);
        
        try {
            const checkout = await createCheckout(
                plan,
                crypto.randomUUID(),
            );
            
            if (!checkout.url) {
                throw new Error(
                    "Checkout service did not return a URL.",
                );
            }
            
            // console.log("checkout");
            // console.log(checkout);

            const url = new URL(checkout.url);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("Invalid checkout URL.");
            }

            // if (url.origin !== window.location.origin) {
            //     throw new Error(
            //         "Checkout must use the local InsightFlow application.",
            //     );
            // }

            window.location.assign(url.toString());
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Unable to create checkout.",
            );

            setProcessingPlan(null);
        }
    }


    return (
        <section>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white pt-20">Available plans</h2>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Choose the right capacity for your organization.</p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
                {PLANS.map((plan) => {
                    const current = billinginfo.plan === plan.id;
                    const paid = plan.id !== "free";
                    const canCheckout = paid && !current && billinginfo.status !== "active";
                    return (
                        <PlanCard key={plan.id} plan={plan} current={current} canCheckout={canCheckout} processingPlan={processingPlan} onCheckout={handleCheckout} />
                    );
                })}
            </div>
        </section>
    )
}


