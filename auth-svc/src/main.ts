import { config } from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
config();
import { loadVaultSecrets } from './vault';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	try {
		await loadVaultSecrets();
	} catch(e) {
		Logger.error(`Vault unavailable, cannot start: ${e}`);
		process.exit(1);
	}
	const { AppModule } = await import('./app.module.js');

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

   const config = new DocumentBuilder()
    .setTitle('auth-svc')
    .setDescription('Identity, organizations, members, password, GDPR (owner: Mehdi)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
