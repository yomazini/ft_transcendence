import { authHeaders } from "@/lib/auth";

export type PlanTier = "Free" | "Premium" | "Extra";
export type PaidPlan = Exclude<PlanTier, "Free">;

export interface Billing {
  organization_id: string;
  plan: PlanTier;
  status: "free" | "active";
  member_count: number;
  max_users: number;
  price_cents: number;
  subscription_end: string | null;
}

export interface CheckoutResponse {
  url: string;
}

export interface SubscriptionResponse {
  message: string;
}

export async function send<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message ??
        `Request failed (${response.status})`,
    );
  }

  return data as T;
}

export function getBilling(): Promise<Billing> {
  return send<Billing>("/api/orgs/billing");
}

export function createCheckout(
  plan: PaidPlan,
): Promise<CheckoutResponse> {
  return send<CheckoutResponse>(
    "/api/orgs/billing/checkout",
    {
      method: "POST",
      body: JSON.stringify({ plan }),
    },
  );
}

export function deleteSubscription(): Promise<SubscriptionResponse> {
  return send<SubscriptionResponse>(
    "/api/orgs/billing/subscription",
    {
      method: "DELETE",
    },
  );
}

export function updateSubscription(
  plan: PaidPlan,
): Promise<SubscriptionResponse> {
  return send<SubscriptionResponse>(
    "/api/orgs/billing",
    {
      method: "PATCH",
      body: JSON.stringify({ plan }),
    },
  );
}


export interface Payment {
  id: string;
  amount_cents: number;
  currency: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void" | null;
  created_at: string;
  invoice_url: string | null;
  invoice_pdf: string | null;
}

export function getPayments(): Promise<Payment[]> {
  return send<Payment[]>("/api/orgs/billing/payments");
}

