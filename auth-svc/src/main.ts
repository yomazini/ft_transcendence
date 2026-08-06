// auth-svc — NestJS. Users, orgs, RBAC, OAuth (42), 2FA, JWT issuing.
// Depends on: @nestjs/core, @nestjs/jwt, passport, passport-42, bcrypt,
// otplib (2FA), class-validator.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
