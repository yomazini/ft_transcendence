
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingWebhookController } from './billing-webhook.controller';
import { BillingWebhookService } from './billing-webhook.service';
import { StripeProvider } from './stripe.provider';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [
    BillingController,
    BillingWebhookController,
  ],
  providers: [
    StripeProvider,
    BillingService,
    BillingWebhookService,
  ],
  exports: [BillingService],
})
export class BillingModule {}
