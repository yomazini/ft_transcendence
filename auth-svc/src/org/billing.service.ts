import {
	Injectable,
	BadRequestException,
	ForbiddenException,
	NotFoundException,
	ConflictException,
	ServiceUnavailableException,
} from '@nestjs/common';
import Stripe from 'stripe';
import {
	PlanTier,
	PaymentStatus,
	SubscriptionStatus,
	Prisma,
	Payment,
} from '../../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto, PaidPlan as p } from './dto/checkout.dto';

/* @MEHDIJAD:note who is calling billing, read from the verified JWT (sub, org_id, role).
	- We trust the token instead of querying memberships by user_id: team rule "org_id from the token",
	- one less DB query, and no 400 if a user is in 2 orgs. Stale-role risk (max 1 h) → issue 16. */

export interface BillingIdentity {
	userId: string;
	organizationId: string;
	role: string;
}

type ApiPlan = 'free' | 'premium' | 'extra';
type PaidPlan = 'premium' | 'extra';
type SimulatedOutcome = 'succeeded' | 'failed';

const PLANS: Record<
	ApiPlan,
	{ price: number; maxUsers: number;}
> = {
	free: { price: 0, maxUsers: 1},
	premium: { price: 2900, maxUsers: 5},
	extra: { price: 5900, maxUsers: 20},
};

const PENDING_CHECKOUT_MS = 30 * 60 * 1000;

function toPrismaPlan(plan: PaidPlan): PlanTier {
	return plan === 'premium' ? PlanTier.Premium : PlanTier.Extra;
}

function toApiPlan(plan: PlanTier): ApiPlan {
	switch (plan) {
		case PlanTier.Premium:
			return 'premium';
		case PlanTier.Extra:
			return 'extra';
		default:
			return 'free';
	}
}

function toApiPaymentStatus(
	status: PaymentStatus,
): 'pending' | 'succeeded' | 'failed' {
	switch (status) {
		case PaymentStatus.Succeeded:
			return 'succeeded';
		case PaymentStatus.Failed:
			return 'failed';
		default:
			return 'pending';
	}
}

@Injectable()
export class BillingService {
	private readonly stripe: Stripe;

	private readonly frontendUrl =
		process.env.FRONTEND_URL ?? 'http://localhost:8080';

	constructor(private readonly prisma: PrismaService) {
		this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock', {
			host: process.env.STRIPE_MOCK_HOST ?? 'stripe-mock',
			port: 12111,
			protocol: 'http',
			maxNetworkRetries: 1,
			timeout: 10000,
		});
	}

	private async getOrganization(identity: BillingIdentity, admin = false) {
		if (admin && identity.role !== 'Admin') {
			throw new ForbiddenException(
				'Only organization admins can manage billing',
			);
		}
		const organization = await this.prisma.organization.findUnique({
			where: { id: identity.organizationId },
		});

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}

		return organization;
	}

	async assertCanAddMember(orgId: string, db: Prisma.TransactionClient = this.prisma): Promise<void> {
		const organization = await db.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}

		const subscription = await db.subscription.findFirst({
			where: {
				org_id: orgId,
				status: SubscriptionStatus.Active,
				ends_at: { gt: new Date() },
			},
			orderBy: { ends_at: 'desc' },
		});

		const plan = toApiPlan(subscription?.plan ?? PlanTier.Free);

		const memberCount = await db.role_and_organization.count({
			where: { org_id: orgId },
		});

		const maxUsers = PLANS[plan].maxUsers;

		if (memberCount >= maxUsers) {
			throw new ForbiddenException(
				`Your ${plan} plan allows a maximum of ${maxUsers} users. Upgrade your plan.`,
			);
		}
	}

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

		const plan = toApiPlan(subscription?.plan ?? PlanTier.Free);

		return {
			organization_id: org.id,
			plan,
			status: subscription ? 'active' : 'free',
			member_count: memberCount,
			max_users: PLANS[plan].maxUsers,
			price_cents: PLANS[plan].price,
			subscription_end: subscription?.ends_at ?? null,
			cancel_at_period_end: subscription?.cancel_at_period_end ?? false,
		};
	}

	async checkout(identity: BillingIdentity, dto: CheckoutDto) {
		const org = await this.getOrganization(identity, true);

		// if (dto.plan !== 'premium' && dto.plan !== 'extra') {
		// 	throw new BadRequestException('Invalid paid plan');
		// }

		if (dto.plan !== p.premium && dto.plan !== p.extra) {
			throw new BadRequestException('Invalid paid plan');
		}
		const plan: PaidPlan = dto.plan;
		const prismaPlan = toPrismaPlan(plan);

		const amountCents = PLANS[plan].price;

		let payment: Payment;
		try {
			payment = await this.prisma.$transaction(async (tx) => {
				await this.prisma.lock_organization(tx, org.id);

				const existing = await tx.payment.findUnique({
					where: {
						idempotency_key: dto.idempotency_key,
					},
				});

				if (existing) {
					if (existing.org_id !== org.id || existing.plan !== prismaPlan) {
						throw new ConflictException('Idempotency key already used');
					}

					throw new ConflictException('Checkout already exists for this request');
				}

				const active = await tx.subscription.findFirst({
					where: {
						org_id: org.id,
						status: SubscriptionStatus.Active,
						ends_at: { gt: new Date() },
					},
				});

				if (active) {
					throw new ConflictException('An active subscription already exists');
				}

				const pending = await tx.payment.findFirst({
					where: {
						org_id: org.id,
						status: PaymentStatus.Pending,
						created_at: { gt: new Date(Date.now() - PENDING_CHECKOUT_MS) },
					},
				});

				if (pending) {
					throw new ConflictException('A checkout is already in progress');
				}

				return tx.payment.create({
					data: {
						org_id: org.id,
						plan: prismaPlan,
						amount_cents: amountCents,
						currency: 'USD',
						status: PaymentStatus.Pending,
						idempotency_key: dto.idempotency_key,
					},
				});
			});
		} catch (error: any) {
			if (error?.code === 'P2002') {
				throw new ConflictException('Checkout already exists for this request');
			}
			throw error;
		}

		const checkoutUrl = new URL(
			`${identity.userId}/billing/checkout`,
			this.frontendUrl.endsWith('/')
				? this.frontendUrl
				: `${this.frontendUrl}/`,
		);

		checkoutUrl.searchParams.set('payment_id', payment.id);

		try {
			const session = await this.stripe.checkout.sessions.create(
				{
					mode: 'payment',
					line_items: [
						{
							price_data: {
								currency: 'usd',
								unit_amount: amountCents,
								product_data: {
									name: `InsightFlow ${plan}`,
								},
							},
							quantity: 1,
						},
					],
					success_url: `${this.frontendUrl}/${identity.userId}/billing?payment_id=${payment.id}`,
					cancel_url: `${this.frontendUrl}/${identity.userId}/billing`,
					client_reference_id: payment.id,
					metadata: {
						payment_id: payment.id,
						organization_id: org.id,
						plan,
					},
				},
				{
					idempotencyKey: dto.idempotency_key,
				},
			);

			if (!session.id) {
				throw new Error('Stripe Mock returned no session ID');
			}

			await this.prisma.payment.update({
				where: { id: payment.id },
				data: {
					provider_reference: session.id,
				},
			});

			return {
				payment_id: payment.id,
				url: checkoutUrl.toString(),
			};
		} catch {
			await this.prisma.payment.updateMany({
				where: {
					id: payment.id,
					status: PaymentStatus.Pending,
				},
				data: {
					status: PaymentStatus.Failed,
					failure_reason: 'Unable to create Stripe Mock session',
				},
			});

			throw new ServiceUnavailableException(
				'Unable to create Stripe Mock checkout',
			);
		}
	}

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

		const status = toApiPaymentStatus(payment.status);

		return {
			payment_id: payment.id,
			status,
			message:
				status === 'succeeded'
					? 'Payment successful'
					: status === 'failed'
						? (payment.failure_reason ?? 'Payment failed')
						: 'Waiting for simulated payment confirmation',
			...(status === 'succeeded' ? { plan: toApiPlan(payment.plan) } : {}),
		};
	}

	async simulatePayment(
		identity: BillingIdentity,
		paymentId: string,
		outcome: SimulatedOutcome,
	) {
		// if (process.env.NODE_ENV !== 'development') {
		// 	throw new ForbiddenException('Payment simulation is disabled');
		// }

		if (outcome !== 'succeeded' && outcome !== 'failed') {
			throw new BadRequestException('Invalid simulated outcome');
		}

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

		if (!payment.provider_reference) {
			throw new ConflictException('Stripe Mock session is missing');
		}

		if (payment.status === PaymentStatus.Succeeded) {
			return {
				payment_id: payment.id,
				status: 'succeeded',
				message: 'Payment already completed',
				plan: toApiPlan(payment.plan),
			};
		}

		if (payment.status === PaymentStatus.Failed) {
			throw new ConflictException('Payment has already failed');
		}

		if (outcome === 'failed') {
			const updated = await this.prisma.payment.updateMany({
				where: {
					id: payment.id,
					status: PaymentStatus.Pending,
				},
				data: {
					status: PaymentStatus.Failed,
					failure_reason: 'Simulated payment declined',
				},
			});

			if (updated.count === 0) {
				throw new ConflictException('Payment status has changed');
			}

			return {
				payment_id: payment.id,
				status: 'failed',
				message: 'Simulated payment failed',
			};
		}

		await this.prisma.$transaction(async (tx) => {
			await this.prisma.lock_organization(tx, org.id);

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
				throw new ConflictException('Payment status has changed');
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
			message: 'Simulated payment successful',
			plan: toApiPlan(payment.plan),
		};
	}

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
			plan: toApiPlan(payment.plan),
			status: toApiPaymentStatus(payment.status),
		}));
	}

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
			data: {
				cancel_at_period_end: true,
			},
		});

		return {
			message: 'Subscription will expire at the end of the paid period',
			ends_at: subscription.ends_at,
		};
	}
}
