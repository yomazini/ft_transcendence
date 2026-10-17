
import { PlanType } from '../../generated/prisma/client';

export const PLAN_LIMITS: Record<PlanType, number> = {
  FREE: 0,
  PREMIUM: 5,
  ENTERPRISE: 10,
};

export function getMaxMembers(plan: PlanType): number {
  // Organization Admin + additional members
  return PLAN_LIMITS[plan] + 1;
}
