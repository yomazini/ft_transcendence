import { config } from 'dotenv';
config({ path: '.env.example' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/** @note this is just NestJS's naming convention for "the function that starts everything,"  */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
   }));
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
