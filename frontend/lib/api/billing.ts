
import { authHeaders } from "@/lib/auth";

export type Plan = "STARTER" | "PRO" | "ENTERPRISE";
export type BillingAction = "UPGRADE" | "DOWNGRADE" | "CANCEL";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SubscriptionRequest {
  id: string;
  org_id: string;
  action: BillingAction;
  target_plan: Plan | null;
  status: RequestStatus;
  created_at: string;
}

export interface Billing {
  id: string;
  name: string;
  plan: Plan;
  subscription_requests: SubscriptionRequest[];
}

async function send<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;

    throw new Error(message ?? `Request failed (${response.status})`);
  }

  return data as T;
}

export const getBilling = (orgId: string) =>
  send<Billing>(`/api/billing/${encodeURIComponent(orgId)}`);

export const requestBillingChange = (
  orgId: string,
  action: BillingAction,
  targetPlan?: Plan,
) =>
  send<{
    message: string;
    request: SubscriptionRequest;
  }>(`/api/billing/${encodeURIComponent(orgId)}/request`, {
    method: "POST",
    body: JSON.stringify({
      action,
      ...(targetPlan ? { target_plan: targetPlan } : {}),
    }),
  });

// Staff only — requires backend staff authorization.
export const reviewBillingRequest = (
  requestId: string,
  status: "APPROVED" | "REJECTED",
) =>
  send<{
    message: string;
    request: SubscriptionRequest;
  }>(`/api/billing/requests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
