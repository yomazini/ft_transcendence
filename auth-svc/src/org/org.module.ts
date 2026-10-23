import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  controllers: [OrgController, BillingController],
  providers: [OrgService],
  imports: [PrismaModule, MailModule,BillingService,
	JwtModule.register({ secret: process.env.JWT_SECRET!})],
})
export class OrgModule {}
