
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtGuard } from '../auth/guard/jwt.guard';
import { BillingService } from './billing.service';
import { CheckoutDto } from './dto/checkout.dto';
import { AuthUser } from './billing.types';

@Controller('orgs/:id/billing')
@UseGuards(JwtGuard)
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
  ) {}

  @Get()
  getBilling(
    @Param('id') id: string,
    @Req() req: { user: AuthUser },
  ) {
    return this.billingService.getBilling(
      id,
      req.user,
    );
  }

  @Post('checkout')
  createCheckout(
    @Param('id') id: string,
    @Body() dto: CheckoutDto,
    @Req() req: { user: AuthUser },
  ) {
    return this.billingService.createCheckout(
      id,
      dto.plan,
      req.user,
    );
  }

  @Post('cancel')
  cancelSubscription(
    @Param('id') id: string,
    @Req() req: { user: AuthUser },
  ) {
    return this.billingService.cancelSubscription(
      id,
      req.user,
    );
  }
}
