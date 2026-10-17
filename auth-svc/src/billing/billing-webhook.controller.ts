
import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';

import { BillingWebhookService } from './billing-webhook.service';

@Controller('billing')
export class BillingWebhookController {
  constructor(
    private readonly webhookService: BillingWebhookService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody || !signature) {
      throw new BadRequestException(
        'Missing Stripe webhook signature or raw body',
      );
    }

    await this.webhookService.handle(
      req.rawBody,
      signature,
    );

    return { received: true };
  }
}
