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
  // so only that origin may call it cross-site  (FRONTEND_URL, e.g. https://localhost).
  // btw thi s browser only restriction that will auto send origin header ;
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'https://localhost',
    methods: 'GET,HEAD,PATCH,POST,PUT,DELETE,OPTIONS',

    // let secturity headers pass like cookies authen and etc...
    credentials: true,
  });

  // Validate every request body, query, and route parameter before controllers.
  app.useGlobalPipes(
    new ValidationPipe({
      // Convert plain JSON to DTO instances and apply type conversions.
      transform: true,
      // Remove properties that have no validation decorator in the DTO.
      whitelist: true,
      // Ignore unknown properties. Set to true to reject them with 400.
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger metadata only. This documents the API; it does not validate requests.
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
