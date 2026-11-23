
import { type PaidPlan } from "@/lib/api/billing";
import { PLANS } from "@/lib/billing/plans";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";


type Plan = (typeof PLANS)[number];

export function PlanCard({ plan, current, canCheckout, processingPlan, onCheckout }: {
  plan: Plan;
  current: boolean;
  canCheckout: boolean;
  processingPlan: PaidPlan | null;
  onCheckout: (plan: PaidPlan) => void;
}) {
  const paid = plan.id === "free";

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900/60 ${current ? "border-orange-500 ring-1 ring-orange-500" : "border-zinc-200 dark:border-white/10"
      }`}>
      {current && (
        <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-3 py-1 text-xs font-medium text-white">Current plan</span>
      )}
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{plan.name}</h3>
      <p className="mt-2 min-h-10 text-sm text-zinc-700 dark:text-zinc-300">{plan.description}</p>
      <div className="mt-5">
        <span className="text-4xl font-bold text-zinc-900 dark:text-white">${plan.price}</span>
        <span className="text-sm text-zinc-700 dark:text-zinc-300"> / month</span>
      </div>
      <div className="my-6 border-t border-zinc-100 dark:border-white/10" />
      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <Check className="mt-0.5 size-4 shrink-0 text-orange-600 dark:text-orange-400" />
            {feature}
          </li>
        ))}
      </ul>
      {paid ? (
        <button type="button" disabled className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-500 dark:border-white/10">Free plan</button>
      ) : current ? (
        <button type="button" disabled className="w-full rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Current plan</button>
      ) : (
        <button type="button" disabled={!canCheckout || processingPlan !== null}
          onClick={() => onCheckout(plan.id as PaidPlan)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-50">
          {processingPlan === plan.id ? (
            <><Loader2 className="size-4 animate-spin" />Redirecting...</>
          ) : (
            <>Choose {plan.name}<ArrowUpRight className="size-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
