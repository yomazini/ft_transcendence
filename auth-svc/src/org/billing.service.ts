import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  PlanTier,
  PaymentStatus,
  SubscriptionStatus,
} from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

export const PLANS = {
  Free: { price: 0, maxUsers: 1, maxJobs: 5 },
  Premium: { price: 2900, maxUsers: 5, maxJobs: 10 },
  Extra: { price: 5900, maxUsers: 20, maxJobs: 20 },
} as const;

export interface BillingIdentity {
  userId: string;
  orgId: string;
  role: string;
}

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

  private async getOrganization(identity: BillingIdentity, admin = false) {
    if (admin && identity.role !== 'Admin') {
      throw new ForbiddenException(
        'Only organization admins can manage billing',
      );
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: identity.orgId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

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
        'Fake Bank payment service is unavailable',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Fake Bank returned HTTP ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }

  async assertCanAddMember(orgId: string) {
    const [memberCount, subscription] = await Promise.all([
      this.prisma.role_and_organization.count({
        where: { org_id: orgId },
      }),
      this.prisma.subscription.findFirst({
        where: {
          org_id: orgId,
          status: SubscriptionStatus.Active,
          ends_at: { gt: new Date() },
        },
        orderBy: { ends_at: 'desc' },
      }),
    ]);

    const plan: PlanTier = subscription?.plan ?? PlanTier.Free;

    if (memberCount >= PLANS[plan].maxUsers) {
      throw new ForbiddenException(
        `Member limit reached for the ${plan.toLowerCase()} plan (${PLANS[plan].maxUsers})`,
      );
    }
  }

  // GET /orgs/billing
  async getBilling(identity: BillingIdentity) {
    const org = await this.getOrganization(identity);

    const [memberCount, subscription] = await Promise.all([
      this.prisma.role_and_organization.count({
        where: { org_id: org.id },
      }),
      this.prisma.subscription.findFirst({
        where: {
          org_id: org.id,
          status: SubscriptionStatus.Active,
          ends_at: { gt: new Date() },
        },
        orderBy: { ends_at: 'desc' },
      }),
    ]);

    const plan: PlanTier = subscription?.plan ?? PlanTier.Free;

    return {
      organization_id: org.id,
      plan: plan.toLowerCase(),
      status: subscription?.status.toLowerCase() ?? 'free',
      member_count: memberCount,
      max_users: PLANS[plan].maxUsers,
      max_jobs: PLANS[plan].maxJobs,
      price_cents: PLANS[plan].price,
      subscription_end: subscription?.ends_at ?? null,
      cancel_at_period_end:
        subscription?.cancel_at_period_end ?? false,
    };
  }

  // POST /orgs/billing/checkout
  async checkout(identity: BillingIdentity, dto: CheckoutDto) {
    const org = await this.getOrganization(identity, true);

    if (dto.plan !== 'premium' && dto.plan !== 'extra') {
      throw new BadRequestException('Invalid paid plan');
    }

    const plan = dto.plan === 'premium' ? PlanTier.Premium : PlanTier.Extra;

    const existing = await this.prisma.payment.findUnique({
      where: { idempotency_key: dto.idempotency_key },
    });

    if (existing) {
      if (existing.org_id !== org.id || existing.plan !== plan) {
        throw new ConflictException('Idempotency key already used');
      }

      throw new ConflictException(
        'Checkout already exists for this request',
      );
    }

    const active = await this.prisma.subscription.findFirst({
      where: {
        org_id: org.id,
        status: SubscriptionStatus.Active,
        ends_at: { gt: new Date() },
      },
    });

    if (active) {
      throw new ConflictException(
        'An active subscription already exists',
      );
    }

    const amountCents = PLANS[plan].price;

    const payment = await this.prisma.payment.create({
      data: {
        org_id: org.id,
        plan,
        amount_cents: amountCents,
        currency: 'USD',
        status: PaymentStatus.Pending,
        idempotency_key: dto.idempotency_key,
      },
    });

    const returnUrl = new URL(
      `${identity.userId}/billing`,
      this.frontendUrl,
    );

    returnUrl.searchParams.set('payment_id', payment.id);

    const checkout = await this.bankRequest<FakeBankCheckout>(
      '/v1/payments',
      'POST',
      {
        merchant_id: this.merchantId,
        merchant_reference: payment.id,
        amount: amountCents / 100,
        currency: 'USD',
        payment_method: 'card',
        return_url: returnUrl.toString(),
        webhook_url: process.env.FAKE_BANK_WEBHOOK_URL,
        scenario: 'card_success',
      },
    );

    if (!checkout.payment_id || !checkout.checkout_url) {
      throw new ServiceUnavailableException(
        'Invalid Fake Bank checkout response',
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

  // POST /orgs/billing/verify/:paymentId
  async verify(identity: BillingIdentity, paymentId: string) {
    const org = await this.getOrganization(identity, true);

    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        org_id: org.id,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.Succeeded) {
      return {
        payment_id: payment.id,
        status: 'succeeded',
        message: 'Payment successful',
        plan: payment.plan.toLowerCase(),
      };
    }

    if (payment.status === PaymentStatus.Failed) {
      return {
        payment_id: payment.id,
        status: 'failed',
        message: 'Payment failed',
      };
    }

    if (!payment.provider_reference) {
      throw new ConflictException(
        'Payment provider reference is missing',
      );
    }

    const bankPayment = await this.bankRequest<FakeBankPayment>(
      `/v1/payments/${encodeURIComponent(payment.provider_reference)}`,
    );

    // Never trust the return URL alone.
    // Confirm the payment details with Fake Bank.
    if (
      bankPayment.payment_id !== payment.provider_reference ||
      bankPayment.merchant_id !== this.merchantId ||
      bankPayment.merchant_reference !== payment.id ||
      Math.round(bankPayment.amount * 100) !== payment.amount_cents ||
      bankPayment.currency !== payment.currency
    ) {
      throw new ForbiddenException(
        'Fake Bank payment verification mismatch',
      );
    }

    if (
      bankPayment.status === 'created' ||
      bankPayment.status === 'pending'
    ) {
      return {
        payment_id: payment.id,
        status: 'pending',
        message: 'Waiting for bank confirmation',
      };
    }

    if (bankPayment.status === 'failed') {
      await this.prisma.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.Pending,
        },
        data: {
          status: PaymentStatus.Failed,
          failure_reason: 'Payment declined by Fake Bank',
        },
      });

      return {
        payment_id: payment.id,
        status: 'failed',
        message: 'Payment failed',
      };
    }

    if (bankPayment.status !== 'succeeded') {
      throw new BadRequestException(
        'Unknown Fake Bank payment status',
      );
    }

    // Activate the subscription once.
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.Pending,
        },
        data: {
          status: PaymentStatus.Succeeded,
        },
      });

      if (claimed.count === 0) {
        return;
      }

      const active = await tx.subscription.findFirst({
        where: {
          org_id: org.id,
          status: SubscriptionStatus.Active,
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
          status: SubscriptionStatus.Active,
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
    });

    return {
      payment_id: payment.id,
      status: 'succeeded',
      message: 'Payment successful',
      plan: payment.plan.toLowerCase(),
    };
  }

  // GET /orgs/billing/payments
  async getPayments(identity: BillingIdentity) {
    const org = await this.getOrganization(identity, true);

    const payments = await this.prisma.payment.findMany({
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

    return payments.map((payment) => ({
      ...payment,
      plan: payment.plan.toLowerCase(),
      status: payment.status.toLowerCase(),
    }));
  }

  // POST /orgs/billing/cancel
  async cancel(identity: BillingIdentity) {
    const org = await this.getOrganization(identity, true);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        org_id: org.id,
        status: SubscriptionStatus.Active,
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
