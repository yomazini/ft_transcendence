import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [OrgController],
  providers: [OrgService],
  imports: [PrismaModule, MailModule,
	JwtModule.register({ secret: process.env.JWT_SECRET!})
  ],
})
export class OrgModule {}
