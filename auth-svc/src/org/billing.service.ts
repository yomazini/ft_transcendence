
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import {
  PlanTier,
  PaymentStatus,
  SubscriptionStatus,
} from '../generated/prisma/client';

// Adjust this import to your existing PrismaService location.
import { PrismaService } from '../prisma/prisma.service';

import { CheckoutDto } from './dto/checkout.dto';

const PLANS = {
  free: { price: 0, maxUsers: 1 },
  premium: { price: 2900, maxUsers: 5 },
  extra: { price: 5900, maxUsers: 20 },
} as const;

interface FakeBankCheckout {
  payment_id: string;
  status: string;
  checkout_url: string;
}

interface FakeBankPayment {
  payment_id: string;
  merchant_id: string;
  merchant_reference?: string;
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'succeeded' | 'failed';
}

@Injectable()
export class BillingService {
  private readonly bankUrl =
    process.env.FAKE_BANK_URL ?? 'http://fake-bank-api:8080';

  private readonly merchantId =
    process.env.FAKE_BANK_MERCHANT_ID ?? 'insightflow';

  private readonly frontendUrl =
    process.env.FRONTEND_URL ?? 'http://localhost:8080';

  constructor(private readonly prisma: PrismaService) {}

  // --------------------------------------------------
  // Resolve organization from authenticated user
  // --------------------------------------------------

  private async getOrganization(userId: string, admin = false) {
    const memberships = await this.prisma.role_and_organization.findMany({
      where: { user_id: userId },
      include: { organization: true },
      take: 2,
    });

    if (memberships.length === 0) {
      throw new NotFoundException('Organization not found');
    }

    if (memberships.length > 1) {
      throw new BadRequestException(
        'Multiple organizations found. An active organization must be selected.',
      );
    }

    const membership = memberships[0];

    if (admin && membership.role !== 'Admin') {
      throw new ForbiddenException(
        'Only organization admins can manage billing',
      );
    }

    return membership.organization;
  }

  // --------------------------------------------------
  // Request Fake-bank API
  // --------------------------------------------------

  private async bankRequest<T>(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
  ): Promise<T> {
    let response: Response;

    try {
      response = await fetch(`${this.bankUrl}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Fake-bank payment service is unavailable',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Fake-bank returned HTTP ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  // --------------------------------------------------
  // GET /orgs/billing
  // --------------------------------------------------

  async getBilling(userId: string) {
    const org = await this.getOrganization(userId);

    const now = new Date();

    const [memberCount, subscription] = await Promise.all([
      this.prisma.role_and_organization.count({
        where: { org_id: org.id },
      }),

      this.prisma.subscription.findFirst({
        where: {
          org_id: org.id,
          status: SubscriptionStatus.active,
          ends_at: { gt: now },
        },
        orderBy: { ends_at: 'desc' },
      }),
    ]);

    const plan: PlanTier = subscription?.plan ?? PlanTier.free;

    return {
      organization_id: org.id,
      plan,
      status: subscription?.status ?? 'free',
      member_count: memberCount,
      max_users: PLANS[plan].maxUsers,
      price_cents: PLANS[plan].price,
      subscription_end: subscription?.ends_at ?? null,
      cancel_at_period_end:
        subscription?.cancel_at_period_end ?? false,
    };
  }

  // --------------------------------------------------
  // POST /orgs/billing/checkout
  // --------------------------------------------------

  async checkout(userId: string, dto: CheckoutDto) {
    const org = await this.getOrganization(userId, true);

    if (dto.plan !== 'premium' && dto.plan !== 'extra') {
      throw new BadRequestException('Invalid paid plan');
    }

    const plan = dto.plan as PlanTier;

    const existing = await this.prisma.payment.findUnique({
      where: { idempotency_key: dto.idempotency_key },
    });

    if (existing) {
      if (existing.org_id !== org.id || existing.plan !== plan) {
        throw new ConflictException('Idempotency key already used');
      }

      throw new ConflictException(
        'Checkout already created. Use a new key or recover the existing payment.',
      );
    }

    const active = await this.prisma.subscription.findFirst({
      where: {
        org_id: org.id,
        status: SubscriptionStatus.active,
        ends_at: { gt: new Date() },
      },
    });

    if (active) {
      throw new ConflictException(
        'An active subscription already exists. Plan switching is not implemented yet.',
      );
    }

    const amountCents = PLANS[plan].price;

    const payment = await this.prisma.payment.create({
      data: {
        org_id: org.id,
        plan,
        amount_cents: amountCents,
        currency: 'USD',
        status: PaymentStatus.pending,
        idempotency_key: dto.idempotency_key,
      },
    });

    const returnUrl = new URL(
      '/dashboard/billing',
      this.frontendUrl,
    );

    returnUrl.searchParams.set('payment_id', payment.id);

    let checkout: FakeBankCheckout;

    try {
      checkout = await this.bankRequest<FakeBankCheckout>(
        '/v1/payments',
        'POST',
        {
          merchant_id: this.merchantId,
          merchant_reference: payment.id,

          // Fake-bank uses dollars, Prisma uses cents.
          amount: amountCents / 100,
          currency: 'USD',
          payment_method: 'card',

          return_url: returnUrl.toString(),

          // Must be reachable from the Fake-bank API container.
          webhook_url: process.env.FAKE_BANK_WEBHOOK_URL,

          scenario: 'card_success',
        },
      );
    } catch (error) {
      // Do not mark failed automatically: the provider may
      // have created the payment before the request timed out.
      throw error;
    }

    if (!checkout.payment_id || !checkout.checkout_url) {
      throw new ServiceUnavailableException(
        'Fake-bank returned an invalid checkout response',
      );
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        provider_reference: checkout.payment_id,
      },
    });

    return {
      payment_id: payment.id,
      url: checkout.checkout_url,
    };
  }

  // --------------------------------------------------
  // POST /orgs/billing/verify/:paymentId
  // --------------------------------------------------

  async verify(userId: string, paymentId: string) {
    const org = await this.getOrganization(userId, true);

    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        org_id: org.id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (!payment.provider_reference) {
      throw new ConflictException(
        'Payment provider reference is missing',
      );
    }

    if (payment.status === PaymentStatus.succeeded) {
      return {
        payment_id: payment.id,
        status: 'succeeded',
      };
    }

    if (payment.status === PaymentStatus.failed) {
      return {
        payment_id: payment.id,
        status: 'failed',
      };
    }

    const bankPayment = await this.bankRequest<FakeBankPayment>(
      `/v1/payments/${encodeURIComponent(payment.provider_reference)}`,
    );

    // Verify that the provider response belongs to our payment.
    if (
      bankPayment.payment_id !== payment.provider_reference ||
      bankPayment.merchant_id !== this.merchantId ||
      bankPayment.merchant_reference !== payment.id ||
      Math.round(bankPayment.amount * 100) !== payment.amount_cents ||
      bankPayment.currency !== payment.currency
    ) {
      throw new ForbiddenException(
        'Fake-bank payment verification mismatch',
      );
    }

    if (
      bankPayment.status === 'created' ||
      bankPayment.status === 'pending'
    ) {
      return {
        payment_id: payment.id,
        status: 'pending',
      };
    }

    if (bankPayment.status === 'failed') {
      await this.prisma.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.pending,
        },
        data: {
          status: PaymentStatus.failed,
          failure_reason: 'Payment declined by Fake-bank',
        },
      });

      return {
        payment_id: payment.id,
        status: 'failed',
      };
    }

    if (bankPayment.status !== 'succeeded') {
      throw new BadRequestException(
        'Unknown Fake-bank payment status',
      );
    }

    // Activate exactly once. The conditional update prevents
    // repeated verification from creating duplicate subscriptions.
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.pending,
        },
        data: {
          status: PaymentStatus.succeeded,
        },
      });

      if (claimed.count === 0) {
        return;
      }

      const active = await tx.subscription.findFirst({
        where: {
          org_id: org.id,
          status: SubscriptionStatus.active,
          ends_at: { gt: new Date() },
        },
      });

      if (active) {
        throw new ConflictException(
          'Organization already has an active subscription',
        );
      }

      const startedAt = new Date();
      const endsAt = new Date(startedAt);

      endsAt.setUTCDate(endsAt.getUTCDate() + 30);

      const subscription = await tx.subscription.create({
        data: {
          org_id: org.id,
          plan: payment.plan,
          status: SubscriptionStatus.active,
          started_at: startedAt,
          ends_at: endsAt,
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          subscription_id: subscription.id,
        },
      });

      await tx.organization.update({
        where: { id: org.id },
        data: { plan: payment.plan },
      });
    });

    return {
      payment_id: payment.id,
      status: 'succeeded',
    };
  }

  // --------------------------------------------------
  // GET /orgs/billing/payments
  // --------------------------------------------------

  async getPayments(userId: string) {
    const org = await this.getOrganization(userId, true);

    return this.prisma.payment.findMany({
      where: { org_id: org.id },
      orderBy: { created_at: 'desc' },
      take: 50,
      select: {
        id: true,
        plan: true,
        amount_cents: true,
        currency: true,
        status: true,
        failure_reason: true,
        created_at: true,
      },
    });
  }

  // --------------------------------------------------
  // POST /orgs/billing/cancel
  // --------------------------------------------------

  async cancel(userId: string) {
    const org = await this.getOrganization(userId, true);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        org_id: org.id,
        status: SubscriptionStatus.active,
        ends_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription');
    }

    if (subscription.cancel_at_period_end) {
      return {
        message: 'Subscription already scheduled for cancellation',
        ends_at: subscription.ends_at,
      };
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancel_at_period_end: true },
    });

    return {
      message: 'Subscription will expire at the end of the paid period',
      ends_at: subscription.ends_at,
    };
  }
}
