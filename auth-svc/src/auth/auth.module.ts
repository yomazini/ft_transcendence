import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { FortyTwoStrategy } from './strategy/42.strategy';
import { MailModule } from '../mail/mail.module';
import { TokenDenylist } from './token-denylist.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FortyTwoStrategy, TokenDenylist],
  imports: [
    PrismaModule,
    MailModule,
    JwtModule.register({
		secret: process.env.JWT_SECRET!,
		signOptions: { expiresIn: '1h' }
    })
  ]
})
export class AuthModule {}
