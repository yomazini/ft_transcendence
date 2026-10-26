
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

import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
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

@ApiTags('billing')
@ApiBearerAuth()
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
  @ApiResponse({ status: 200, description: 'Current plan, status, members and limits' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
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
  @ApiResponse({ status: 201, description: 'Payment created, returns the fake-bank checkout URL' })
  @ApiResponse({ status: 400, description: 'Invalid plan or idempotency key' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Not an Admin of the organization' })
  @ApiResponse({ status: 409, description: 'Idempotency key reused or subscription already active' })
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
  @ApiResponse({ status: 201, description: 'Payment status; on success the subscription is active' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Not an Admin of the organization' })
  @ApiResponse({ status: 404, description: 'Payment not found in this organization' })
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
  @ApiResponse({ status: 200, description: 'Last 50 payments of the organization' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Not an Admin of the organization' })
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
  @ApiResponse({ status: 201, description: 'Subscription will end at the end of the period' })
  @ApiResponse({ status: 401, description: 'Missing or invalid token' })
  @ApiResponse({ status: 403, description: 'Not an Admin of the organization' })
  @ApiResponse({ status: 404, description: 'No active subscription' })
  async cancel(@Req() req: AuthenticatedRequest) {
    return this.billingService.cancel(
      this.getIdentity(req),
    );
  }
}
