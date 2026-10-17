
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PrismaService } from '../prisma/prisma.service';
import {
  PlanType,
  SubscriptionStatus,
} from '../../generated/prisma/client';
import { STRIPE_CLIENT } from './stripe.provider';

@Injectable()
export class BillingWebhookService {
  private readonly logger = new Logger(
    BillingWebhookService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(STRIPE_CLIENT)
    private readonly stripe: Stripe,
  ) {}

  async handle(
    rawBody: Buffer,
    signature: string,
  ): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.config.getOrThrow<string>(
          'STRIPE_WEBHOOK_SECRET',
        ),
      );
    } catch {
      throw new BadRequestException(
        'Invalid Stripe webhook signature',
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        if (session.mode !== 'subscription') {
          break;
        }

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (subscriptionId) {
          await this.syncSubscription(subscriptionId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await this.syncSubscription(
          event.data.object.id,
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await this.prisma.organization.updateMany({
          where: {
            stripe_subscription_id: subscription.id,
          },
          data: {
            plan: PlanType.FREE,
            subscription_status:
              SubscriptionStatus.CANCELED,
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            subscription_end: new Date(),
          },
        });
        break;
      }
    }

    this.logger.log(`Processed ${event.type}`);
  }

  private mapStatus(
    status: Stripe.Subscription.Status,
  ): SubscriptionStatus {
    switch (status) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'incomplete':
        return SubscriptionStatus.INCOMPLETE;
      case 'unpaid':
        return SubscriptionStatus.UNPAID;
      default:
        return SubscriptionStatus.CANCELED;
    }
  }

  private mapPlan(priceId: string): PlanType {
    if (
      priceId === this.config.getOrThrow<string>(
        'STRIPE_PREMIUM_PRICE_ID',
      )
    ) {
      return PlanType.PREMIUM;
    }

    if (
      priceId === this.config.getOrThrow<string>(
        'STRIPE_ENTERPRISE_PRICE_ID',
      )
    ) {
      return PlanType.ENTERPRISE;
    }

    throw new Error(
      `Unknown Stripe price: ${priceId}`,
    );
  }

  private async syncSubscription(
    subscriptionId: string,
  ): Promise<void> {
    const subscription =
      await this.stripe.subscriptions.retrieve(
        subscriptionId,
      );

    const item = subscription.items.data[0];

    if (!item) {
      throw new Error(
        'Subscription has no price item',
      );
    }

    const plan = this.mapPlan(item.price.id);
    const status = this.mapStatus(subscription.status);

    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    const orgId = subscription.metadata.orgId;

    const org = orgId
      ? await this.prisma.organization.findUnique({
          where: { id: orgId },
        })
      : await this.prisma.organization.findUnique({
          where: {
            stripe_customer_id: customerId,
          },
        });

    if (!org) {
      throw new Error(
        'Organization for subscription not found',
      );
    }

    if (
      org.stripe_customer_id &&
      org.stripe_customer_id !== customerId
    ) {
      throw new Error(
        'Stripe customer does not match organization',
      );
    }

    if (
      org.stripe_subscription_id &&
      org.stripe_subscription_id !== subscription.id
    ) {
      throw new Error(
        'Organization already has another subscription',
      );
    }

    await this.prisma.organization.update({
      where: { id: org.id },
      data: {
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan,
        subscription_status: status,
        subscription_start: new Date(
          item.current_period_start * 1000,
        ),
        subscription_end: new Date(
          item.current_period_end * 1000,
        ),
        cancel_at_period_end:
          subscription.cancel_at_period_end,
      },
    });
  }
}
