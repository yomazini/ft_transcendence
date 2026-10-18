import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MailModule,
  ],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}