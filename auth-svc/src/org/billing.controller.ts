
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

import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';

interface AuthenticatedRequest {
  user?: {
    sub?: string;
    id?: string;
  };
}

@Controller('orgs/billing')
@UseGuards(JwtGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
  ) { }

  private getIdentity(req: AuthenticatedRequest): string {
    const userId = req.user?.sub ?? req.user?.id;

    if (!userId) {
      throw new UnauthorizedException(
        'Invalid or missing user identity',
      );
    }

    return userId;
  }

  // GET /orgs/billing
  // Current organization subscription and usage
  @Get()
  async getBilling(@Req() req: AuthenticatedRequest) {
    return this.billingService.getBilling(
      this.getIdentity(req),
    );
  }

  // GET /orgs/billing/payments
  // Organization payment history
  @Get('payments')
  async getPayments(@Req() req: AuthenticatedRequest) {
    return this.billingService.getPayments(
      this.getIdentity(req),
    );
  }

  // POST /orgs/billing/checkout
  // Create a simulated Stripe checkout
  @Post('checkout')
  async checkout(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CheckoutDto,
  ) {
    return this.billingService.checkout(
      this.getIdentity(req),
      dto,
    );
  }

  // POST /orgs/billing/verify/:paymentId
  // Check the locally recorded payment status
  @Post('verify/:paymentId')
  async verify(
    @Req() req: AuthenticatedRequest,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.billingService.verify(
      this.getIdentity(req),
      paymentId,
    );
  }

  // POST /orgs/billing/cancel
  // Cancel at the end of the paid period
  @Post('cancel')
  async cancel(@Req() req: AuthenticatedRequest) {
    return this.billingService.cancel(
      this.getIdentity(req),
    );
  }

  @Post('simulate/:paymentId')
  async simulatePayment(
    @Req() req: AuthenticatedRequest,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body('outcome') outcome: 'succeeded' | 'failed',
  ) {
    return this.billingService.simulatePayment(
      this.getIdentity(req),
      paymentId,
      outcome,
    );
  }
}
