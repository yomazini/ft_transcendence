
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
  constructor(
    private readonly billingService: BillingService,
  ) {}

  // Get authenticated user ID from JWT
  private getIdentity(req: AuthenticatedRequest): BillingIdentity {
    const userId = req.user?.sub ?? req.user?.id;
    const orgId = req.user?.org_id;
    const role = req.user?.role;

    if (!userId || !orgId || !role) {
      throw new UnauthorizedException(
        'Invalid or missing user identity',
      );
    }

    return { userId, orgId, role };
  }

  // ==========================================
  // GET /orgs/billing
  // Get current organization billing details
  // ==========================================

  @Get()
  async getBilling(@Req() req: AuthenticatedRequest) {
    return this.billingService.getBilling(
      this.getIdentity(req),
    );
  }

  // ==========================================
  // POST /orgs/billing/checkout
  // Create Fake Bank checkout session
  // ==========================================

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

  // ==========================================
  // POST /orgs/billing/verify/:paymentId
  // Verify payment after Fake Bank redirect
  // ==========================================

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

  // ==========================================
  // GET /orgs/billing/payments
  // Get organization payment history
  // ==========================================

  @Get('payments')
  async getPayments(@Req() req: AuthenticatedRequest) {
    return this.billingService.getPayments(
      this.getIdentity(req),
    );
  }

  // ==========================================
  // POST /orgs/billing/cancel
  // Cancel subscription at period end
  // ==========================================

  @Post('cancel')
  async cancel(@Req() req: AuthenticatedRequest) {
    return this.billingService.cancel(
      this.getIdentity(req),
    );
  }
}
