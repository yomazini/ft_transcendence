import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { loadVaultSecrets } from './vault';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    await loadVaultSecrets();
  } catch (e) {
    Logger.warn(`Vault unavailable; using .env: ${e}`);
  }

  const app = await NestFactory.create(AppModule);
  // The browser reaches the gateway through nginx on the frontend's own origin,
  // so only that origin may call it cross-site (FRONTEND_URL, e.g. http://localhost).
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost',
    methods: 'GET,HEAD,PATCH,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Groundswell Gateway Service')
    .setDescription(
      'Public API Gateway, JWT verification, rate limiting, BullMQ producer, and WebSockets',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api-json',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Gateway service running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  console.log(`OpenAPI JSON available at http://localhost:${port}/api-json`);
}
bootstrap();
