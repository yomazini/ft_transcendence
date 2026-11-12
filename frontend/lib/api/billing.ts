
import { authHeaders } from "@/lib/auth";

export type PlanTier = "free" | "premium" | "extra";
export type PaidPlan = Exclude<PlanTier, "free">;

export type PaymentStatus =
  | "pending"
  | "succeeded"
  | "failed";

export type SimulationOutcome = "succeeded" | "failed";

export interface Billing {
  organization_id: string;
  plan: PlanTier;
  status: "free" | "active" | "canceled" | "expired";
  member_count: number;
  max_users: number;
  max_jobs: number;
  price_cents: number;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
}

export interface Payment {
  id: string;
  plan: PlanTier;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  failure_reason: string | null;
  created_at: string;
}

export interface CheckoutResponse {
  payment_id: string;
  url: string;
}

export interface VerifyResponse {
  payment_id: string;
  status: PaymentStatus;
  message?: string;
  plan?: PaidPlan;
}

export interface CancelResponse {
  message: string;
  ends_at: string;
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
      ...(init.headers ?? {}),
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

// =============================================
// GET /api/orgs/billing
// =============================================

export function getBilling(): Promise<Billing> {
  return send<Billing>("/api/orgs/billing");
}

// =============================================
// GET /api/orgs/billing/payments
// =============================================

export function getPayments(): Promise<Payment[]> {
  return send<Payment[]>("/api/orgs/billing/payments");
}

// =============================================
// POST /api/orgs/billing/checkout
// Create Stripe Mock checkout session
// =============================================

export function createCheckout(
  plan: PaidPlan,
  idempotencyKey: string,
): Promise<CheckoutResponse> {
  return send<CheckoutResponse>(
    "/api/orgs/billing/checkout",
    {
      method: "POST",
      body: JSON.stringify({
        plan,
        idempotency_key: idempotencyKey,
      }),
    },
  );
}

// =============================================
// POST /api/orgs/billing/verify/:paymentId
// Read payment status from backend
// =============================================

export function verifyCheckout(
  paymentId: string,
): Promise<VerifyResponse> {
  return send<VerifyResponse>(
    `/api/orgs/billing/verify/${encodeURIComponent(paymentId)}`,
    {
      method: "POST",
    },
  );
}

// =============================================
// Poll until simulated payment is finalized
// =============================================

export async function verifyCheckoutUntilComplete(
  paymentId: string,
  options: {
    maxAttempts?: number;
    intervalMs?: number;
    signal?: AbortSignal;
  } = {},
): Promise<VerifyResponse> {
  const {
    maxAttempts = 5,
    intervalMs = 1500,
    signal,
  } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (signal?.aborted) {
      throw new Error("Verification canceled");
    }

    const result = await verifyCheckout(paymentId);

    if (
      result.status === "succeeded" ||
      result.status === "failed"
    ) {
      return result;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise<void>((resolve, reject) => {
        if (signal?.aborted) {
          reject(new Error("Verification canceled"));
          return;
        }

        const timeout = setTimeout(() => {
          signal?.removeEventListener("abort", onAbort);
          resolve();
        }, intervalMs);

        function onAbort() {
          clearTimeout(timeout);
          signal?.removeEventListener("abort", onAbort);
          reject(new Error("Verification canceled"));
        }

        signal?.addEventListener("abort", onAbort, {
          once: true,
        });
      });
    }
  }

  return {
    payment_id: paymentId,
    status: "pending",
    message:
      "Payment confirmation is taking longer than expected",
  };
}

// =============================================
// POST /api/orgs/billing/simulate/:paymentId
// Development-only simulated payment
// =============================================

export function simulatePayment(
  paymentId: string,
  outcome: SimulationOutcome,
): Promise<VerifyResponse> {
  return send<VerifyResponse>(
    `/api/orgs/billing/simulate/${encodeURIComponent(paymentId)}`,
    {
      method: "POST",
      body: JSON.stringify({ outcome }),
    },
  );
}

// =============================================
// POST /api/orgs/billing/cancel
// =============================================

export function cancelSubscription(): Promise<CancelResponse> {
  return send<CancelResponse>(
    "/api/orgs/billing/cancel",
    {
      method: "POST",
    },
  );
}
