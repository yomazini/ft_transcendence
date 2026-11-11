import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { DenylistModule } from '../auth/denylist.module';
import { ApiKeyService } from './api-key/api-key.service';
import { ApiKeyController } from './api-key/api-key.controller';

@Module({
  controllers: [BillingController, OrgController, ApiKeyController],
  providers: [OrgService, BillingService, ApiKeyService],
  exports: [BillingService],
  imports: [PrismaModule, MailModule, DenylistModule,
	JwtModule.register({ secret: process.env.JWT_SECRET!})],
})
export class OrgModule {}
