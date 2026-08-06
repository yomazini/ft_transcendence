// gateway-svc — NestJS. Public API entry point, JWT verification, rate
// limiting, WebSocket gateway. Depends on: @nestjs/core, @nestjs/websockets,
// @nestjs/throttler, @nestjs/jwt.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
