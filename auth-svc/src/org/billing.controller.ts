import {
	Controller,
	Post,
	Req,
	Headers,
	type RawBodyRequest,
	HttpCode,
	BadRequestException,
	UseGuards,
	UnauthorizedException,
	Get,
	Body,
	Delete,
	Patch,
} from '@nestjs/common';

import { BillingIdentity, BillingService, PaymentHistory } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';

interface AuthenticatedRequest {
	user?: {
		sub?: string;
		id?: string;
		org_id?: string;
		role?: string;
	};
}

@Controller('orgs/billing')
export class BillingController {
	constructor(private readonly billingService: BillingService) { }

	private getIdentity(req: AuthenticatedRequest): BillingIdentity {
		const userId = req.user?.sub ?? req.user?.id;
		const organizationId = req.user?.org_id;
		const role = req.user?.role;

		if (!userId || !organizationId || !role) {
			throw new UnauthorizedException('Invalid or missing user identity');
		}

		return { userId, organizationId, role };
	}

	@UseGuards(JwtGuard)
	@Get()
	getBilling(@Req() req: AuthenticatedRequest) {
		return this.billingService.getBilling(this.getIdentity(req));
	}

	@UseGuards(JwtGuard)
	@Get('payments')
	getPaymentsHistory(@Req() req: AuthenticatedRequest) : Promise<PaymentHistory[]>  {
		return this.billingService.getPaymentsHistory(
			this.getIdentity(req),
		);
	}


	@Post('webhook')
	webhook(
		@Req() req: RawBodyRequest<Request>,
		@Headers('stripe-signature') signature: string,
	) {
		console.log('Signature exists:', !!signature);
		console.log('Raw body exists:', !!req.rawBody);
		if (!req.rawBody || !signature) {
			throw new BadRequestException(
				'Missing body or signature',
			);
		}

		return this.billingService.stripeWebhooks(
			req.rawBody,
			signature,
		);
	}

	@UseGuards(JwtGuard)
	@Post('checkout')
	createCheckout(
		@Req() req: AuthenticatedRequest,
		@Body() dto: CheckoutDto,
	) {
		return this.billingService.createCheckout(
			this.getIdentity(req),
			dto,
		);
	}

	@UseGuards(JwtGuard)
	@Delete('subscription')
	deleteSubscription(@Req() req: AuthenticatedRequest) {
		return this.billingService.deleteSubscription(
			this.getIdentity(req),
		);
	}

	@UseGuards(JwtGuard)
	@Patch()
	updateSubscription(
		@Req() req: AuthenticatedRequest,
		@Body() dto: CheckoutDto,
	) {
		return this.billingService.updateSubscription(
			this.getIdentity(req),
			dto,
		);
	}

	

}
