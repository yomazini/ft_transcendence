
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CreditCard,
  Crown,
  Loader2,
  Users,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  getBilling,
  getPayments,
  createCheckout,
  verifyCheckoutUntilComplete,
  cancelSubscription,
  type Billing,
  type Payment,
  type PaidPlan,
} from "@/lib/api/billing";

import { getMe, type User } from "@/lib/auth";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    maxUsers: 1,
    maxJobs: 5,
    description: "For individuals getting started.",
    features: [
      "1 organization member",
      "Up to 5 analysis jobs",
      "Basic workspace access",
      "Community support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29,
    maxUsers: 5,
    maxJobs: 10,
    description: "For growing teams.",
    features: [
      "Up to 5 organization members",
      "Up to 10 analysis jobs",
      "Team collaboration",
      "Advanced insights",
      "Priority support",
    ],
  },
  {
    id: "extra",
    name: "Extra",
    price: 59,
    maxUsers: 20,
    maxJobs: 20,
    description: "For larger organizations.",
    features: [
      "Up to 20 organization members",
      "Up to 20 analysis jobs",
      "Team collaboration",
      "Advanced insights",
      "Priority support",
    ],
  },
] as const;

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    succeeded: "bg-green-500/10 text-green-600 dark:text-green-400",
    active: "bg-green-500/10 text-green-600 dark:text-green-400",
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    failed: "bg-red-500/10 text-red-600 dark:text-red-400",
    canceled: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    expired: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    free: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
      }`}
    >
      {status}
    </span>
  );
}

function BillingHeader() {
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
  );
}

function PaymentVerification({ verifying, needsRetry, onRetry }: {
  verifying: boolean;
  needsRetry: boolean;
  onRetry: () => void;
}) {
  if (verifying) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-500/20 dark:bg-orange-500/10">
        <Loader2 className="size-5 animate-spin text-orange-600 dark:text-orange-400" />
        Verifying your simulated payment...
      </div>
    );
  }
  if (!needsRetry) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <p className="text-sm">Payment confirmation is not complete yet.</p>
      <button type="button" onClick={onRetry} className="rounded-lg bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 px-4 py-2 text-sm font-medium text-white hover:from-orange-600 hover:to-amber-600">
        Check payment again
      </button>
    </div>
  );
}

function CurrentPlanCard({ billing, isAdmin, canceling, verifying, onCancel }: {
  billing: Billing;
  isAdmin: boolean;
  canceling: boolean;
  verifying: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-zinc-900 dark:text-white">Current plan</h2>
        <StatusBadge status={billing.status} />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
          <Crown className="size-6" />
        </div>
        <div>
          <p className="text-2xl font-semibold capitalize text-zinc-900 dark:text-white">{billing.plan}</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{formatAmount(billing.price_cents, "USD")} / month</p>
        </div>
      </div>
      {billing.subscription_end && (
        <div className="mt-6 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <CalendarDays className="size-4" />
          Access until {formatDate(billing.subscription_end)}
        </div>
      )}
      {billing.cancel_at_period_end && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">Your subscription is scheduled to expire.</p>
      )}
      {isAdmin && billing.status === "active" && !billing.cancel_at_period_end && (
        <button type="button" onClick={onCancel} disabled={canceling || verifying}
          className="mt-5 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-zinc-800">
          {canceling ? "Canceling..." : "Cancel subscription"}
        </button>
      )}
    </div>
  );
}

function TeamUsageCard({ billing, usagePercentage }: { billing: Billing; usagePercentage: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-orange-600 dark:text-orange-400" />
        <h2 className="font-semibold text-zinc-900 dark:text-white">Team usage</h2>
      </div>
      <p className="mt-7 text-3xl font-semibold text-zinc-900 dark:text-white">
        {billing.member_count}
        <span className="text-base font-normal text-zinc-700 dark:text-zinc-300"> / {billing.max_users} members</span>
      </p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 transition-all" style={{ width: `${usagePercentage}%` }} />
      </div>
      <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
        {Math.max(0, billing.max_users - billing.member_count)} seats available on your current plan.
      </p>
    </div>
  );
}

type Plan = (typeof PLANS)[number];

function PlanCard({ plan, current, canCheckout, processingPlan, onCheckout }: {
  plan: Plan;
  current: boolean;
  canCheckout: boolean;
  processingPlan: PaidPlan | null;
  onCheckout: (plan: PaidPlan) => void;
}) {
  const paid = plan.id !== "free";
  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900/60 ${
      current ? "border-orange-500 ring-1 ring-orange-500" : "border-zinc-200 dark:border-white/10"
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
      {current ? (
        <button type="button" disabled className="w-full rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Current plan</button>
      ) : !paid ? (
        <button type="button" disabled className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-500 dark:border-white/10">Free plan</button>
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

function AvailablePlans({ billing, isAdmin, verifying, needsRetry, processingPlan, onCheckout }: {
  billing: Billing;
  isAdmin: boolean;
  verifying: boolean;
  needsRetry: boolean;
  processingPlan: PaidPlan | null;
  onCheckout: (plan: PaidPlan) => void;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Available plans</h2>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Choose the right capacity for your organization.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => {
          const current = billing.plan === plan.id;
          const paid = plan.id !== "free";
          const canCheckout = isAdmin && paid && !current && billing.status !== "active" && !verifying && !needsRetry;
          return (
            <PlanCard key={plan.id} plan={plan} current={current} canCheckout={canCheckout}
              processingPlan={processingPlan} onCheckout={onCheckout} />
          );
        })}
      </div>
      {!isAdmin && (
        <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">Only organization administrators can change subscription plans.</p>
      )}
    </section>
  );
}

function PaymentHistory({ payments }: { payments: Payment[] }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Payment history</h2>
      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Recent simulated payments processed using Stripe Mock.</p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
        {payments.length === 0 ? (
          <div className="flex flex-col items-center p-12 text-center">
            <div className="mb-3 rounded-xl bg-orange-50 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <CreditCard className="size-7" />
            </div>
            <p className="font-medium">No payments yet</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">Your payment history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-white/10 dark:bg-zinc-800/50 dark:text-zinc-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Plan</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-zinc-100 last:border-0 dark:border-white/10">
                    <td className="px-5 py-4 font-medium capitalize">{payment.plan}</td>
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">{formatDate(payment.created_at)}</td>
                    <td className="px-5 py-4">{formatAmount(payment.amount_cents, payment.currency)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={payment.status} />
                      {payment.status === "failed" && payment.failure_reason && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{payment.failure_reason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<PaidPlan | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationRetry, setVerificationRetry] = useState(0);
  const [needsRetry, setNeedsRetry] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "Admin";

  const loadBilling = useCallback(async () => {
    const currentBilling = await getBilling();
    setBilling(currentBilling);
  }, []);

  const loadPayments = useCallback(async () => {
    const currentPayments = await getPayments();
    setPayments(currentPayments);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const currentUser = await getMe();
        if (!active) return;

        setUser(currentUser);

        const currentBilling = await getBilling();
        if (!active) return;

        setBilling(currentBilling);

        if (currentUser.role === "Admin") {
          const currentPayments = await getPayments();
          if (active) setPayments(currentPayments);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load billing information.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading || !isAdmin) return;

    const paymentId = new URLSearchParams(
      window.location.search,
    ).get("payment_id");

    if (!paymentId) return;

    const controller = new AbortController();
    let active = true;

    async function checkPayment() {
      setVerifying(true);
      setNeedsRetry(false);

      try {
        const result = await verifyCheckoutUntilComplete(paymentId!, {
          maxAttempts: 6,
          intervalMs: 1500,
          signal: controller.signal,
        });

        if (!active) return;

        if (result.status === "succeeded") {
          await Promise.all([loadBilling(), loadPayments()]);
          if (!active) return;

          toast.success("Payment successful! Your plan is active.");
        } else if (result.status === "failed") {
          await loadPayments();
          if (!active) return;

          toast.error("Payment failed. Please try again.");
        } else {
          setNeedsRetry(true);
          toast.info(
            "Payment confirmation is pending. Please retry verification.",
          );
        }

        if (result.status !== "pending") {
          const url = new URL(window.location.href);
          url.searchParams.delete("payment_id");

          window.history.replaceState(
            window.history.state,
            "",
            url.toString(),
          );
        }
      } catch (err) {
        if (!active || controller.signal.aborted) return;

        setNeedsRetry(true);
        toast.error(
          err instanceof Error
            ? err.message
            : "Unable to verify payment.",
        );
      } finally {
        if (active) setVerifying(false);
      }
    }

    void checkPayment();

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    loading,
    isAdmin,
    loadBilling,
    loadPayments,
    verificationRetry,
  ]);

  async function handleCheckout(plan: PaidPlan) {
    if (!isAdmin) {
      toast.error(
        "Only organization admins can manage billing.",
      );
      return;
    }

    if (billing?.status === "active") {
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

      const url = new URL(checkout.url);

      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid checkout URL.");
      }

      if (url.origin !== window.location.origin) {
        throw new Error(
          "Checkout must use the local InsightFlow application.",
        );
      }

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

  async function handleCancel() {
    if (!isAdmin) return;

    if (
      !window.confirm(
        "Cancel your subscription at the end of the current billing period?",
      )
    ) {
      return;
    }

    setCanceling(true);

    try {
      const result = await cancelSubscription();

      toast.success(result.message);
      await loadBilling();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to cancel subscription.",
      );
    } finally {
      setCanceling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold">
            Unable to load billing
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "Billing information is unavailable."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  

  const usagePercentage = Math.min(
    100,
    Math.round(
      (billing.member_count / billing.max_users) * 100,
    ),
  );

  return (
    <div className="page-d"> {/*mx-auto max-w-9xl space-y-8 p-4 pb-12 md:p-8*/}
      <BillingHeader />
      <PaymentVerification
        verifying={verifying}
        needsRetry={needsRetry}
        onRetry={() => setVerificationRetry((count) => count + 1)}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <CurrentPlanCard billing={billing} isAdmin={isAdmin} canceling={canceling}
          verifying={verifying} onCancel={handleCancel} />
        <TeamUsageCard billing={billing} usagePercentage={usagePercentage} />
      </div>
      <AvailablePlans billing={billing} isAdmin={isAdmin} verifying={verifying}
        needsRetry={needsRetry} processingPlan={processingPlan} onCheckout={handleCheckout} />
      {isAdmin && <PaymentHistory payments={payments} />}
    </div>
  );
}