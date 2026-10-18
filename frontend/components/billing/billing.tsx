"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Clock3,
  Crown,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  getBilling,
  requestBillingChange,
  type Billing,
  type Plan,
  type BillingAction,
} from "@/lib/api/billing";

import type { Role } from "@/lib/auth";

const plans = [
  {
    id: "STARTER" as Plan,
    name: "Starter",
    price: "$0",
    description: "For individuals exploring market insights.",
    features: [
      "5 AI reports / month",
      "Basic sentiment analysis",
      "1 workspace",
      "Community support",
    ],
  },
  {
    id: "PRO" as Plan,
    name: "Pro",
    price: "$29",
    description: "For startups and growing product teams.",
    features: [
      "Unlimited AI reports",
      "Competitor analysis",
      "AI search (RAG)",
      "Real-time monitoring",
      "PDF & CSV export",
      "Priority support",
    ],
  },
  {
    id: "ENTERPRISE" as Plan,
    name: "Enterprise",
    price: "Custom",
    description: "Advanced security and collaboration.",
    features: [
      "Unlimited workspaces",
      "Dedicated infrastructure",
      "Custom integrations",
      "SSO authentication",
      "Role-based permissions",
      "Dedicated success manager",
    ],
  },
];

const planRank: Record<Plan, number> = {
  STARTER: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

interface BillingPageProps {
  orgId: string;
  role: Role;
}

export default function BillingPage({
  orgId,
  role,
}: BillingPageProps) {
  const [billing, setBilling] = useState<Billing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === "Admin";

  const loadBilling = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBilling(orgId);
      setBilling(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load billing",
      );
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  const pendingRequest = billing?.subscription_requests.find(
    (request) => request.status === "PENDING",
  );

  async function handleRequest(targetPlan: Plan) {
    if (!billing || !isAdmin || pendingRequest) return;

    const currentRank = planRank[billing.plan];
    const targetRank = planRank[targetPlan];

    if (currentRank === targetRank) return;

    const action: BillingAction =
      targetRank > currentRank ? "UPGRADE" : "DOWNGRADE";

    try {
      setSubmitting(true);

      await requestBillingChange(orgId, action, targetPlan);

      toast.success("Request sent to staff for approval");
      await loadBilling();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit request",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!billing || !isAdmin || pendingRequest) return;
    if (billing.plan === "STARTER") return;

    try {
      setSubmitting(true);

      await requestBillingChange(orgId, "CANCEL");

      toast.success("Cancellation request submitted");
      await loadBilling();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Unable to load billing information.
        <Button variant="outline" className="ml-3" onClick={loadBilling}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your organization's subscription plan.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Current plan
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                {billing.plan}
              </h2>
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {billing.name}
            </p>
          </div>

          <ShieldCheck className="size-8 text-muted-foreground" />
        </CardContent>
      </Card>

      {pendingRequest && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <Clock3 className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">
              Subscription change pending
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Your {pendingRequest.action.toLowerCase()} request
              {pendingRequest.target_plan
                ? ` to ${pendingRequest.target_plan}`
                : ""}
              {" "}is waiting for staff approval.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Available plans
          </h2>
          <p className="text-sm text-muted-foreground">
            Plan changes are reviewed by our team.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => {
            const current = billing.plan === plan.id;
            const isUpgrade =
              planRank[plan.id] > planRank[billing.plan];

            const disabled =
              current ||
              !isAdmin ||
              Boolean(pendingRequest) ||
              submitting;

            return (
              <Card
                key={plan.id}
                className={
                  plan.id === "PRO"
                    ? "relative border-primary shadow-sm"
                    : ""
                }
              >
                {plan.id === "PRO" && (
                  <Badge className="absolute -top-3 left-5 gap-1">
                    <Crown className="size-3" />
                    Popular
                  </Badge>
                )}

                <CardHeader className="space-y-3">
                  <CardTitle>{plan.name}</CardTitle>

                  <div className="text-3xl font-bold">
                    {plan.price}
                    {plan.id !== "ENTERPRISE" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /month
                      </span>
                    )}
                  </div>

                  <p className="min-h-10 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="flex flex-col gap-6">
                  <ul className="min-h-48 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={current ? "outline" : "default"}
                    disabled={disabled}
                    onClick={() => handleRequest(plan.id)}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}

                    {current
                      ? "Current plan"
                      : !isAdmin
                        ? "Admin only"
                        : pendingRequest
                          ? "Request pending"
                          : isUpgrade
                            ? "Request upgrade"
                            : "Request downgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {isAdmin && billing.plan !== "STARTER" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Cancel subscription
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cancellation requires staff approval. Once approved,
              your organization will return to the Starter plan.
            </p>
          </CardHeader>

          <CardContent>
            <Button
              variant="destructive"
              disabled={submitting || Boolean(pendingRequest)}
              onClick={handleCancel}
            >
              Request cancellation
            </Button>
          </CardContent>
        </Card>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Only organization administrators can request subscription changes.
        </p>
      )}
    </div>
  );
}
