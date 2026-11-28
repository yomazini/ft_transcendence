import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { loadVaultSecrets } from './vault';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  await loadVaultSecrets();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'https://localhost',
    methods: 'GET,HEAD,PATCH,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // JSON => DTO instances n apply type conversions
      transform: true,
      // Remove properties that have no  decorator in the DTO
      whitelist: true,
      //  reject with badreq  400
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('InsightFlow Gateway Service')
    .setDescription(
      'Public API Gateway, JWT verification, rate limiting, BullMQ producer, and WebSockets',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Gateway service running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  console.log(`OpenAPI JSON available at http://localhost:${port}/api-json`);
}
void bootstrap();
