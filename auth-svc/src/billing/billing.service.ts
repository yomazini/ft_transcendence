
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './billing.types';
import { getMaxMembers, PLAN_LIMITS } from './plans';
import {
  PlanType,
  Roles,
} from '../../generated/prisma/client';
import { STRIPE_CLIENT } from './stripe.provider';

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(STRIPE_CLIENT)
    private readonly stripe: Stripe,
  ) {}

  private async authorizeAdmin(
    orgId: string,
    user: AuthUser,
  ) {
    const membership =
      await this.prisma.role_and_organization.findFirst({
        where: {
          org_id: orgId,
          user_id: user.id,
          role: Roles.Admin,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        'Only organization Admins can manage billing',
      );
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async getBilling(orgId: string, user: AuthUser) {
    const org = await this.authorizeAdmin(orgId, user);

    const members =
      await this.prisma.role_and_organization.count({
        where: { org_id: orgId },
      });

    const eligible =
      org.subscription_status === 'ACTIVE' ||
      org.subscription_status === 'TRIALING';

    const effectivePlan = eligible
      ? org.plan
      : PlanType.FREE;

    const maxMembers = getMaxMembers(effectivePlan);

    return {
      organization_id: org.id,
      plan: org.plan,
      effective_plan: effectivePlan,
      subscription_status: org.subscription_status,
      subscription_start: org.subscription_start,
      subscription_end: org.subscription_end,
      cancel_at_period_end: org.cancel_at_period_end,
      usage: {
        members,
        additional_member_limit:
          PLAN_LIMITS[effectivePlan],
        max_members: maxMembers,
        remaining: Math.max(0, maxMembers - members),
        can_invite: members < maxMembers,
      },
    };
  }

  private getPriceId(plan: PlanType): string {
    if (plan === PlanType.PREMIUM) {
      return this.config.getOrThrow<string>(
        'STRIPE_PREMIUM_PRICE_ID',
      );
    }

    if (plan === PlanType.ENTERPRISE) {
      return this.config.getOrThrow<string>(
        'STRIPE_ENTERPRISE_PRICE_ID',
      );
    }

    throw new BadRequestException(
      'Free plan does not require payment',
    );
  }

  async createCheckout(
    orgId: string,
    plan: PlanType,
    user: AuthUser,
  ) {
    const org = await this.authorizeAdmin(orgId, user);
    const priceId = this.getPriceId(plan);

    if (org.stripe_subscription_id) {
      throw new ConflictException(
        'Organization already has a subscription',
      );
    }

    // Reuse the customer on subsequent checkout attempts.
    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const customer = await this.stripe.customers.create(
        {
          name: org.name,
          metadata: { orgId: org.id },
        },
        {
          idempotencyKey: `org-customer-${org.id}`,
        },
      );

      customerId = customer.id;

      await this.prisma.organization.update({
        where: { id: org.id },
        data: { stripe_customer_id: customerId },
      });
    }

    const frontendUrl =
      this.config.getOrThrow<string>('FRONTEND_URL');

    const session =
      await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        client_reference_id: org.id,
        line_items: [
          { price: priceId, quantity: 1 },
        ],
        payment_method_types: ['card'],
        subscription_data: {
          metadata: {
            orgId: org.id,
          },
        },
        success_url:
          `${frontendUrl}/dashboard/billing?checkout=success`,
        cancel_url:
          `${frontendUrl}/dashboard/billing?checkout=cancel`,
      });

    return { url: session.url };
  }

  async cancelSubscription(
    orgId: string,
    user: AuthUser,
  ) {
    const org = await this.authorizeAdmin(orgId, user);

    if (!org.stripe_subscription_id) {
      throw new BadRequestException(
        'No active Stripe subscription found',
      );
    }

    const subscription =
      await this.stripe.subscriptions.update(
        org.stripe_subscription_id,
        { cancel_at_period_end: true },
      );

    // The webhook will synchronize the database.
    return {
      subscription_id: subscription.id,
      cancel_at_period_end:
        subscription.cancel_at_period_end,
    };
  }
}
