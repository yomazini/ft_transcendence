import { config } from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
config({ path: '.env.example' });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/** @note this is just NestJS's naming convention for "the function that starts everything,"  */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

	/** @line_exp .addBearerAuth(): declares the Authorization: Bearer <token> scheme; the UI shows an Authorize button */
   const config = new DocumentBuilder()
    .setTitle('auth-svc')
    .setDescription('Identity, organizations, members, password, GDPR (owner: Mehdi)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
	/** @line_exp createDocument(app, config): must run after NestFactory.create: it reads the registered controllers */
  const document = SwaggerModule.createDocument(app, config);
	/** @line_exp setup('api/docs', ...): auth-svc has no global prefix, so the page is at http://<host>:3002/api/docs */
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
