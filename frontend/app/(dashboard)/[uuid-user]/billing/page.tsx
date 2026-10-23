
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
  XCircle,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";

import {
  getBilling,
  getPayments,
  createCheckout,
  verifyCheckout,
  cancelSubscription,
  type Billing,
  type Payment,
  type PaidPlan,
  type PlanTier,
} from "@/lib/api/billing";

import { getMe, type User } from "@/lib/auth";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    maxUsers: 1,
    description: "For individuals getting started.",
    features: [
      "1 organization member",
      "Basic workspace access",
      "Community support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29,
    maxUsers: 5,
    description: "For growing teams.",
    features: [
      "Up to 5 organization members",
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
    description: "For larger organizations.",
    features: [
      "Up to 20 organization members",
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
    free: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

export default function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<Billing | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<PaidPlan | null>(null);
  const [verifying, setVerifying] = useState(false);
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

    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("payment_id");

    if (!paymentId) return;

    let active = true;

    async function checkPayment() {
      setVerifying(true);

      try {
        const result = await verifyCheckout(paymentId!);

        if (!active) return;

        if (result.status === "succeeded") {
          toast.success("Payment successful! Your plan is active.");
        } else if (result.status === "failed") {
          toast.error("Payment failed. Please try again.");
        } else {
          toast.info("Your payment is still pending.");
        }

        await Promise.all([loadBilling(), loadPayments()]);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Unable to verify payment.",
          );
        }
      } finally {
        if (active) {
          setVerifying(false);
          const url = new URL(window.location.href);
          url.searchParams.delete("payment_id");
          window.history.replaceState({}, "", url.toString());
        }
      }
    }

    void checkPayment();

    return () => {
      active = false;
    };
  }, [loading, isAdmin, loadBilling, loadPayments]);

  async function handleCheckout(plan: PaidPlan) {
    if (!isAdmin) {
      toast.error("Only organization admins can manage billing.");
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
      const checkout = await createCheckout(plan, crypto.randomUUID());

      if (!checkout.url) {
        throw new Error("Payment provider did not return a checkout URL.");
      }

      const url = new URL(checkout.url);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Invalid checkout URL.");
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="text-lg font-semibold">Unable to load billing</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "Billing information is unavailable."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const usagePercentage = Math.min(
    100,
    Math.round((billing.member_count / billing.max_users) * 100),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 pb-12 md:p-8">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          <CreditCard className="h-5 w-5" />
          <span className="text-sm font-medium">Organization billing</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your organization plan, team capacity, and payments.
        </p>
      </div>

      {verifying && (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm">Verifying your payment with Fake-bank...</span>
        </div>
      )}

      {/* Current subscription */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Current plan</h2>
            <StatusBadge status={billing.status} />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <Crown className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold capitalize">{billing.plan}</p>
              <p className="text-sm text-muted-foreground">
                {formatAmount(billing.price_cents, "USD")} / month
              </p>
            </div>
          </div>

          {billing.subscription_end && (
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Access until {formatDate(billing.subscription_end)}
            </div>
          )}

          {billing.cancel_at_period_end && (
            <p className="mt-3 text-sm text-orange-600">
              Your subscription is scheduled to expire.
            </p>
          )}

          {isAdmin &&
            billing.status === "active" &&
            !billing.cancel_at_period_end && (
              <button
                onClick={handleCancel}
                disabled={canceling || verifying}
                className="mt-5 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                {canceling ? "Canceling..." : "Cancel subscription"}
              </button>
            )}
        </div>

        {/* Member usage */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Team usage</h2>
          </div>

          <p className="mt-5 text-3xl font-bold">
            {billing.member_count}
            <span className="text-lg font-normal text-muted-foreground">
              {" "}/ {billing.max_users} members
            </span>
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {Math.max(0, billing.max_users - billing.member_count)} seats
            available on your current plan.
          </p>
        </div>
      </div>

      {/* Pricing */}
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-semibold">Available plans</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose the right capacity for your organization.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const current = billing.plan === plan.id;
            const paid = plan.id !== "free";
            const canCheckout =
              isAdmin &&
              paid &&
              !current &&
              billing.status !== "active" &&
              !verifying;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl border bg-card p-6 ${
                  current ? "border-primary ring-1 ring-primary" : ""
                }`}
              >
                {current && (
                  <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Current plan
                  </span>
                )}

                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                  {plan.description}
                </p>

                <div className="mt-5">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground"> / month</span>
                </div>

                <div className="my-6 border-t" />

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {current ? (
                  <button
                    disabled
                    className="w-full rounded-lg border bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground"
                  >
                    Current plan
                  </button>
                ) : !paid ? (
                  <button
                    disabled
                    className="w-full rounded-lg border px-4 py-2.5 text-sm text-muted-foreground"
                  >
                    Free plan
                  </button>
                ) : (
                  <button
                    disabled={!canCheckout || processingPlan !== null}
                    onClick={() => handleCheckout(plan.id as PaidPlan)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        Choose {plan.name}
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {!isAdmin && (
          <p className="mt-4 text-sm text-muted-foreground">
            Only organization administrators can change subscription plans.
          </p>
        )}

        {billing.status === "active" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Plan switching is not yet supported by the billing backend.
          </p>
        )}
      </section>

      {/* Payment history */}
      {isAdmin && (
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-semibold">Payment history</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recent simulated payments processed through Fake-bank.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <CreditCard className="mb-3 h-9 w-9 text-muted-foreground" />
                <p className="font-medium">No payments yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your payment history will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="px-5 py-4 font-medium">Plan</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Amount</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0">
                        <td className="px-5 py-4 font-medium capitalize">
                          {payment.plan}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(payment.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          {formatAmount(
                            payment.amount_cents,
                            payment.currency,
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={payment.status} />
                          {payment.status === "failed" &&
                            payment.failure_reason && (
                              <p className="mt-1 text-xs text-destructive">
                                {payment.failure_reason}
                              </p>
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
      )}

      {/* Information */}
      <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4">
        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Simulated payments
          </p>
          <p className="mt-1">
            Billing uses Fake-bank for development and testing.
            No real money is charged. Paid access lasts for the
            subscription period recorded by your backend.
          </p>
        </div>
      </div>
    </div>
  );
}
