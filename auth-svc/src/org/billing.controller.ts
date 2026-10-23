
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';

import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('orgs/billing')
@UseGuards(JwtGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
  ) {}

  private getIdentity(req: any) {
    const userId = req.user?.sub ?? req.user?.id;

    if (!userId) {
      throw new ForbiddenException('Invalid user identity');
    }

    return userId as string;
  }

  // GET /orgs/billing
  @Get()
  getBilling(@Req() req: any) {
    return this.billingService.getBilling(
      this.getIdentity(req),
    );
  }

  // POST /orgs/billing/checkout
  @Post('checkout')
  checkout(
    @Req() req: any,
    @Body() dto: CheckoutDto,
  ) {
    return this.billingService.checkout(
      this.getIdentity(req),
      dto,
    );
  }

  // POST /orgs/billing/verify/:paymentId
  @Post('verify/:paymentId')
  verify(
    @Req() req: any,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
  ) {
    return this.billingService.verify(
      this.getIdentity(req),
      paymentId,
    );
  }

  // GET /orgs/billing/payments
  @Get('payments')
  getPayments(@Req() req: any) {
    return this.billingService.getPayments(
      this.getIdentity(req),
    );
  }

  // POST /orgs/billing/cancel
  @Post('cancel')
  cancel(@Req() req: any) {
    return this.billingService.cancel(
      this.getIdentity(req),
    );
  }
}
