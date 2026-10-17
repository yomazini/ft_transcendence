
import { authHeaders } from "@/lib/auth";

export type PlanType = "FREE" | "PREMIUM" | "ENTERPRISE";

export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "UNPAID";

export interface BillingUsage {
  members: number;
  additional_member_limit: number;
  max_members: number;
  remaining: number;
  can_invite: boolean;
}

export interface Billing {
  organization_id: string;
  plan: PlanType;
  effective_plan: PlanType;
  subscription_status: SubscriptionStatus;
  subscription_start: string | null;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
  usage: BillingUsage;
}

export interface CheckoutResponse {
  url: string | null;
}

export interface CancelResponse {
  subscription_id: string;
  cancel_at_period_end: boolean;
}

async function send<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;

    throw new Error(
      message ?? `Request failed (${response.status})`,
    );
  }

  return data as T;
}

const base = (orgId: string) =>
  `/api/orgs/${encodeURIComponent(orgId)}/billing`;

export const getBilling = (orgId: string) =>
  send<Billing>(base(orgId));

export const createCheckout = (
  orgId: string,
  plan: "PREMIUM" | "ENTERPRISE",
) =>
  send<CheckoutResponse>(`${base(orgId)}/checkout`, {
    method: "POST",
    body: JSON.stringify({ plan }),
  });

export const cancelSubscription = (orgId: string) =>
  send<CancelResponse>(`${base(orgId)}/cancel`, {
    method: "POST",
  });
