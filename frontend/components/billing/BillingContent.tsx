
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  getBilling,
  createCheckout,
  cancelSubscription,
  type Billing,
  type PlanType,
} from "@/lib/api/billing";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type BillingContentProps = {
  orgId: string;
};

const plans: {
  plan: PlanType;
  price: number;
  memberLimit: number;
  features: string[];
}[] = [
  {
    plan: "FREE",
    price: 0,
    memberLimit: 0,
    features: [
      "1 organization owner",
      "No additional members",
      "Basic workspace access",
    ],
  },
  {
    plan: "PREMIUM",
    price: 29,
    memberLimit: 5,
    features: [
      "5 additional members",
      "Team collaboration",
      "Premium features",
    ],
  },
  {
    plan: "ENTERPRISE",
    price: 99,
    memberLimit: 10,
    features: [
      "10 additional members",
      "Advanced collaboration",
      "Enterprise features",
    ],
  },
];

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function SeparatorPattern() {
  return (
    <div className="h-8 border-y border-border bg-muted/20" />
  );
}

export default function BillingContent({
  orgId,
}: BillingContentProps) {
  const [billing, setBilling] = useState<Billing | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBilling = useCallback(async () => {
    try {
      setError(null);
      const data = await getBilling(orgId);
      setBilling(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load billing",
      );
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  async function handleUpgrade(
    plan: "PREMIUM" | "ENTERPRISE",
  ) {
    if (action || !billing) return;

    try {
      setAction(plan);

      const result = await createCheckout(orgId, plan);

      if (!result.url) {
        throw new Error("Stripe checkout URL unavailable");
      }

      window.location.assign(result.url);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to start checkout",
      );
      setAction(null);
    }
  }

  async function handleCancel() {
    if (action || !billing) return;

    const confirmed = window.confirm(
      "Cancel your subscription at the end of the billing period?",
    );

    if (!confirmed) return;

    try {
      setAction("cancel");

      await cancelSubscription(orgId);

      toast.success(
        "Cancellation requested. Your plan remains active until the billing period ends.",
      );

      await loadBilling();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to cancel subscription",
      );
    } finally {
      setAction(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="mx-auto max-w-4xl p-8 text-center">
        <p className="text-sm text-destructive">
          {error ?? "Billing information unavailable"}
        </p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setLoading(true);
            void loadBilling();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const usage = billing.usage;
  const currentPlan = billing.effective_plan;

  const percent = usage.max_members
    ? Math.min(
        100,
        Math.round(
          (usage.members / usage.max_members) * 100,
        ),
      )
    : 0;

  const hasPaidSubscription =
    billing.plan !== "FREE" &&
    billing.subscription_status !== "CANCELED";

  return (
    <div className="mx-auto w-full max-w-5xl border border-border bg-background">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-7">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Billing & Subscription
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your organization plan and team usage.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={Boolean(action)}
          onClick={() => {
            setLoading(true);
            void loadBilling();
          }}
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </header>

      <SeparatorPattern />

      {/* Current plan */}
      <section className="px-6 py-10">
        <SectionHeader
          title="Current plan"
          description="Your organization's subscription."
        />

        <div className="mt-6 rounded-xl border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Organization plan
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-semibold capitalize">
                  {billing.plan.toLowerCase()}
                </h3>

                <Badge variant="secondary">
                  {billing.subscription_status.replaceAll(
                    "_",
                    " ",
                  )}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                {usage.additional_member_limit} additional
                team members included
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <CreditCard className="size-5 text-muted-foreground" />
            </div>
          </div>

          {billing.subscription_end && (
            <p className="mt-5 text-sm text-muted-foreground">
              {billing.cancel_at_period_end
                ? "Scheduled cancellation"
                : "Current period ends"}
              : {formatDate(billing.subscription_end)}
            </p>
          )}

          {billing.cancel_at_period_end && (
            <div className="mt-5 rounded-lg border p-4">
              <p className="text-sm">
                Your subscription is scheduled for
                cancellation at the end of the billing period.
              </p>
            </div>
          )}

          {hasPaidSubscription &&
            !billing.cancel_at_period_end && (
              <div className="mt-6 border-t pt-5">
                <Button
                  variant="outline"
                  disabled={Boolean(action)}
                  onClick={() => void handleCancel()}
                >
                  {action === "cancel" && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Cancel subscription
                </Button>
              </div>
            )}
        </div>
      </section>

      <SeparatorPattern />

      {/* Team usage */}
      <section className="px-6 py-10">
        <SectionHeader
          title="Team usage"
          description="Monitor your organization's member capacity."
        />

        <div className="mt-6 rounded-xl border p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-3">
                <Users className="size-5" />
              </div>
              <div>
                <p className="font-medium">Team members</p>
                <p className="text-sm text-muted-foreground">
                  Including organization owner
                </p>
              </div>
            </div>

            <p className="text-lg font-semibold tabular-nums">
              {usage.members} / {usage.max_members}
            </p>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-muted-foreground">
                Seats used
              </span>
              <span>{percent}%</span>
            </div>

            <Progress value={percent} />

            <p className="mt-3 text-xs text-muted-foreground">
              {usage.remaining} seats remaining
            </p>
          </div>

          {!usage.can_invite && (
            <p className="mt-5 rounded-lg bg-muted p-3 text-sm">
              Your organization has reached its member
              limit. Upgrade to invite more people.
            </p>
          )}
        </div>
      </section>

      <SeparatorPattern />

      {/* Plans */}
      <section className="px-6 py-10">
        <SectionHeader
          title="Available plans"
          description="Choose the right plan for your organization."
        />

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const selected = billing.plan === plan.plan;

            const canCheckout =
              plan.plan !== "FREE" &&
              billing.plan === "FREE" &&
              !billing.cancel_at_period_end;

            return (
              <div
                key={plan.plan}
                className={`flex flex-col rounded-xl border p-5 ${
                  selected
                    ? "border-foreground/50 bg-muted/30"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold capitalize">
                    {plan.plan.toLowerCase()}
                  </h3>

                  {selected && (
                    <Badge variant="secondary">
                      Current
                    </Badge>
                  )}
                </div>

                <div className="mt-5">
                  <span className="text-3xl font-semibold">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    /month
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.memberLimit} additional members
                </p>

                <div className="my-6 border-t" />

                <div className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 size-4 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-8 w-full"
                  variant={selected ? "outline" : "default"}
                  disabled={
                    selected ||
                    !canCheckout ||
                    Boolean(action)
                  }
                  onClick={() => {
                    if (
                      plan.plan === "PREMIUM" ||
                      plan.plan === "ENTERPRISE"
                    ) {
                      void handleUpgrade(plan.plan);
                    }
                  }}
                >
                  {action === plan.plan ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : selected ? (
                    "Current plan"
                  ) : plan.plan === "FREE" ? (
                    "Free plan"
                  ) : billing.plan !== "FREE" ? (
                    "Plan changes unavailable"
                  ) : (
                    <>
                      Upgrade
                      <ArrowUpRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {billing.plan !== "FREE" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Switching between paid plans is not available
            in this simplified billing version.
          </p>
        )}
      </section>
    </div>
  );
}
