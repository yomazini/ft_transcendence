import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	UseGuards,
	ParseUUIDPipe,
	UnauthorizedException,
} from '@nestjs/common';

import { BillingIdentity, BillingService } from './billing.service';
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
@UseGuards(JwtGuard)
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

	// Current organization subscription and usage
	@Get()
	getBilling(@Req() req: AuthenticatedRequest) {
		return this.billingService.getBilling(this.getIdentity(req));
	}

	// Organization payment history
	@Get('payments')
	getPayments(@Req() req: AuthenticatedRequest) {
		return this.billingService.getPayments(this.getIdentity(req));
	}

	// Create a simulated Stripe checkout
	@Post('checkout')
	checkout(@Req() req: AuthenticatedRequest, @Body() dto: CheckoutDto) {
		return this.billingService.checkout(this.getIdentity(req), dto);
	}

	// Check the locally recorded payment status
	@Post('cancel/:paymentId')
	verify(
		@Req() req: AuthenticatedRequest,
		@Param('paymentId', ParseUUIDPipe) paymentId: string,
	) {
		return this.billingService.CancelPayment(this.getIdentity(req), paymentId);
	}

	// Cancel at the end of the paid period
	@Post('cancel')
	cancel(@Req() req: AuthenticatedRequest) {
		return this.billingService.cancel(this.getIdentity(req));
	}

	@Post('simulate/:paymentId')
	simulatePayment(
		@Req() req: AuthenticatedRequest,
		@Param('paymentId', ParseUUIDPipe) paymentId: string,
		@Body('outcome') outcome: string,
	) {
		return this.billingService.simulatePayment(
			this.getIdentity(req),
			paymentId,
			outcome,
		);
	}

}
