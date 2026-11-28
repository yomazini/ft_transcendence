import { type Billing } from "@/lib/api/billing";
import { CreditCard } from "lucide-react";


export default function BillingHeader() {



    return (
        <header>
            <div className="mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <CreditCard className="size-5" />
                <span className="text-sm font-medium">Organization billing</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                Billing & Subscription
            </h1>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                Manage your organization plan, team capacity, and payments.
            </p>
        </header>
    )
}

