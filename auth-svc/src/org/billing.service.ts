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
	Prisma,
	Roles
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

type ApiPlan = 'Free' | 'Premium' | 'Extra';
type PaidPlan = 'Premium' | 'Extra';

const PLANS: Record<
	ApiPlan,
	{ price: number; maxUsers: number; }
> = {
	Free: { price: 0, maxUsers: 1 },
	Premium: { price: 2900, maxUsers: 5 },
	Extra: { price: 5900, maxUsers: 20 },
};

function toApiPlan(plan: PlanTier): ApiPlan {
	switch (plan) {
		case PlanTier.Premium:
			return 'Premium';
		case PlanTier.Extra:
			return 'Extra';
		default:
			return 'Free';
	}
}

export interface PaymentHistory {
	id: string;
	amount_cents: number;
	currency: string;
	status: string | null;
	created_at: Date;
	invoice_url: string | null;
	invoice_pdf: string | null;
}


@Injectable()
export class BillingService {
	private readonly stripe: Stripe;

	// private readonly frontendUrl =
	// 	process.env.FRONTEND_URL ?? 'http://localhost:3000';

	constructor(private readonly prisma: PrismaService) {
		const secretKey = process.env.SECRET_KEY;

		if (!secretKey) {
			throw new Error('SECRET_KEY is missing');
		}

		this.stripe = new Stripe(secretKey);
	}


	async assertCanAddMember(
		orgId: string,
		db: Prisma.TransactionClient = this.prisma,
	): Promise<void> {
		const organization = await db.organization.findUnique({
			where: { id: orgId },
			select: { id: true },
		});

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}

		const subscription = await db.subscription.findUnique({
			where: {
				organizationId: orgId,
			},
		});

		const isActive =
			subscription?.status === 'Active' &&
			subscription.endDate > new Date();

		const plan = toApiPlan(
			isActive ? subscription.plan : PlanTier.Free,
		);

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

	private async getOrganization(identity: BillingIdentity, admin = false) {
		const membership =
			await this.prisma.role_and_organization.findFirst({
				where: {
					user_id: identity.userId,
					org_id: identity.organizationId,
				},
				select: {
					org_id: true,
					role: true,
				},
			});

		if (!membership) {
			throw new NotFoundException(
				'Organization membership not found',
			);
		}

		if (admin && membership.role !== Roles.Admin) {
			throw new ForbiddenException(
				'Only organization admins can manage billing',
			);
		}

		return { id: membership.org_id };
	}

	async getBilling(identity: BillingIdentity) {
		const org = await this.getOrganization(identity);

		const [memberCount, subscription] = await Promise.all([
			this.prisma.role_and_organization.count({
				where: { org_id: org.id },
			}),

			this.prisma.subscription.findUnique({
				where: {
					organizationId: org.id,
				},
			}),
		]);

		const isActive =
			subscription?.status === 'Active' &&
			subscription.endDate > new Date();

		const plan = toApiPlan(
			isActive ? subscription.plan : PlanTier.Free,
		);

		return {
			organization_id: org.id,
			plan,
			status: isActive ? 'Active' : 'Free',
			member_count: memberCount,
			max_users: PLANS[plan].maxUsers,
			price_cents: PLANS[plan].price,
			subscription_end: isActive ? subscription.endDate : null,
		};
	}

	private async syncSubscription(
		subscription: Stripe.Subscription,
	) {
		// console.log('[1] Starting syncSubscription');
		// console.log('[2] Subscription ID:', subscription.id);
		// console.log('[3] Subscription status:', subscription.status);

		const customerId =
			typeof subscription.customer === 'string'
				? subscription.customer
				: subscription.customer.id;

		// console.log('[4] Stripe customer ID:', customerId);

		// console.log('[5] Searching for organization...');

		const org = await this.prisma.organization.findUnique({
			where: {
				stripeCustomerId: customerId,
			},
		});

		// console.log('[6] Organization found:', !!org);

		if (!org) {
			console.log('[ERROR] Organization not found');
			throw new NotFoundException('Organization not found');
		}

		// console.log('[7] Organization ID:', org.id);

		const item = subscription.items.data[0];

		// console.log('[8] Subscription item exists:', !!item);

		if (!item) {
			// console.log('[ERROR] Subscription item missing');
			throw new BadRequestException('Subscription item missing');
		}

		const priceId = item.price.id;

		// console.log('[9] Stripe price ID:', priceId);
		// console.log('[10] Premium price ID:', process.env.STRIPE_PREMIUM_PRICE_ID);
		// console.log('[11] Extra price ID:', process.env.STRIPE_EXTRA_PRICE_ID);

		let plan: PlanTier;

		if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
			plan = PlanTier.Premium;
			// console.log('[12] Premium plan selected');
		} else if (priceId === process.env.STRIPE_EXTRA_PRICE_ID) {
			plan = PlanTier.Extra;
			// console.log('[12] Extra plan selected');
		} else {
			// console.log('[ERROR] Invalid Stripe price');
			throw new BadRequestException('Invalid Stripe price');
		}

		// console.log('[13] Period start:', item.current_period_start);
		// console.log('[14] Period end:', item.current_period_end);

		const data = {
			stripeSubscriptionId: subscription.id,
			stripePriceId: priceId,
			plan,
			// status: subscription.status,
			status: subscription.status === 'active'
				? 'Active'
				: subscription.status,
			startDate: new Date(
				item.current_period_start * 1000,
			),
			endDate: new Date(
				item.current_period_end * 1000,
			),
		};

		// console.log('[15] Subscription data:', data);

		// console.log('[16] Saving subscription to PostgreSQL...');

		await this.prisma.subscription.upsert({
			where: {
				organizationId: org.id,
			},
			create: {
				organizationId: org.id,
				...data,
			},
			update: data,
		});

		// console.log('[17] Subscription saved successfully');
		// console.log('[18] syncSubscription completed');
	}

	async stripeWebhooks(body: Buffer, signature: string) {
		const webhookSecret = process.env.SECRET_STRIP_WEBHOOKS;

		if (!webhookSecret) {
			throw new Error('SECRET_STRIP_WEBHOOKS is missing');
		}

		let event: Stripe.Event;

		try {
			event = this.stripe.webhooks.constructEvent(
				body,
				signature,
				webhookSecret,
			);
		} catch {
			throw new BadRequestException('Invalid Stripe signature');
		}

		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object;

				if (
					session.mode !== 'subscription' ||
					typeof session.subscription !== 'string'
				) {
					break;
				}

				const organizationId = session.client_reference_id;
				const customerId = session.customer;

				if (!organizationId || typeof customerId !== 'string') {
					throw new BadRequestException(
						'Missing organization or customer ID',
					);
				}

				const org = await this.prisma.organization.findUnique({
					where: {
						id: organizationId,
					},
				});

				if (!org) {
					throw new NotFoundException('Organization not found');
				}

				const oldSubscription = await this.prisma.subscription.findUnique({
					where: {
						organizationId,
					},
				});

				if (
					org.stripeCustomerId &&
					org.stripeCustomerId !== customerId &&
					oldSubscription?.status !== 'canceled'
				) {
					throw new ConflictException(
						'Organization already has a different Stripe customer',
					);
				}

				await this.prisma.organization.update({
					where: {
						id: organizationId,
					},
					data: {
						stripeCustomerId: customerId,
					},
				});

				const subscription =
					await this.stripe.subscriptions.retrieve(
						session.subscription,
					);

				await this.syncSubscription(subscription);

				break;
			}

			case 'customer.subscription.updated': {
				const subscription =
					await this.stripe.subscriptions.retrieve(
						event.data.object.id,
					);

				await this.syncSubscription(subscription);

				break;
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object;

				await this.prisma.subscription.updateMany({
					where: {
						stripeSubscriptionId: subscription.id,
					},
					data: {
						status: 'canceled',
					},
				});
				break;
			}

			default:
				console.log(`Unhandled event: ${event.type}`);
		}

		return { received: true };
	}

	async createCheckout(
		identity: BillingIdentity,
		dto: CheckoutDto,
	) {
		const org = await this.getOrganization(identity, true);

		const url =
			dto.plan === p.premium
				? process.env.STRIPE_MONTLY_PREMIUM
				: process.env.STRIPE_MONTLY_EXTRA;

		if (!url) {
			throw new ServiceUnavailableException(
				'Stripe payment link not configured',
			);
		}

		const paymentUrl = new URL(url);

		paymentUrl.searchParams.set('client_reference_id', org.id);

		return { url: paymentUrl.toString() };
	}

	async deleteSubscription(identity: BillingIdentity) {
		const org = await this.getOrganization(identity, true);

		const subscription = await this.prisma.subscription.findUnique({
			where: {
				organizationId: org.id,
			},
		});

		if (!subscription || subscription.status === 'canceled') {
			throw new NotFoundException('No subscription to cancel');
		}

		await this.stripe.subscriptions.cancel(
			subscription.stripeSubscriptionId,
		);

		await this.prisma.subscription.update({
			where: {
				id: subscription.id,
			},
			data: {
				status: 'canceled',
			},
		});

		return {
			message: 'Subscription canceled successfully',
		};
	}

	async updateSubscription(
		identity: BillingIdentity,
		dto: CheckoutDto,
	) {
		const org = await this.getOrganization(identity, true);

		const subscription = await this.prisma.subscription.findUnique({
			where: {
				organizationId: org.id,
			},
		});

		if (!subscription || subscription.status !== 'Active') {
			throw new NotFoundException('No active subscription');
		}

		const priceId =
			dto.plan === p.premium
				? process.env.STRIPE_PREMIUM_PRICE_ID
				: process.env.STRIPE_EXTRA_PRICE_ID;

		if (!priceId) {
			throw new ServiceUnavailableException(
				'Stripe price not configured',
			);
		}

		if (subscription.stripePriceId === priceId) {
			throw new ConflictException('You already have this plan');
		}

		const stripeSubscription =
			await this.stripe.subscriptions.retrieve(
				subscription.stripeSubscriptionId,
			);

		const item = stripeSubscription.items.data[0];

		if (!item) {
			throw new BadRequestException('Subscription item missing');
		}

		const updatedSubscription = await this.stripe.subscriptions.update(
			subscription.stripeSubscriptionId,
			{
				items: [
					{
						id: item.id,
						price: priceId,
					},
				],
				proration_behavior: 'always_invoice',
				payment_behavior: 'pending_if_incomplete',
			},
		);

		if (updatedSubscription.pending_update) {
			throw new BadRequestException(
				'Payment is incomplete. Subscription has not changed.',
			);
		}

		await this.syncSubscription(updatedSubscription);

		return {
			message: 'Subscription updated successfully',
		};
	}

	async getPaymentsHistory(identity: BillingIdentity): Promise<PaymentHistory[]> {
		const org = await this.getOrganization(identity);

		const subscriptionIds = new Set<string>();
		const invoices: Stripe.Invoice[] = [];

		for await (const session of this.stripe.checkout.sessions.list({
			status: 'complete',
			limit: 100,
		})) {
			if (
				session.client_reference_id === org.id &&
				typeof session.subscription === 'string'
			) {
				subscriptionIds.add(session.subscription);
			}
		}

		for (const subscriptionId of subscriptionIds) {
			for await (const invoice of this.stripe.invoices.list({
				subscription: subscriptionId,
				limit: 100,
			})) {
				invoices.push(invoice);
			}
		}

		return invoices
			.sort((a, b) => b.created - a.created)
			.map((invoice) => ({
				id: invoice.id,
				amount_cents: invoice.amount_paid,
				currency: invoice.currency,
				status: invoice.status,
				created_at: new Date(invoice.created * 1000),
				invoice_url: invoice.hosted_invoice_url ?? null,
				invoice_pdf: invoice.invoice_pdf ?? null,
			}));
	}

}



