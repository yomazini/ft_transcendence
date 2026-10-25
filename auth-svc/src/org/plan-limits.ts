import { PlanTier } from '../../generated/prisma/client';

export const PLAN_LIMITS: Record<PlanTier, number> = {
  free: 5,
  premium: 20,
  extra: 100,
};