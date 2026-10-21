import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrgModule } from './org/org.module';
import { MailModule } from './mail/mail.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, OrgModule, MailModule, MetricsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
