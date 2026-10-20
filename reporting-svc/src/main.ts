// reporting-svc — NestJS. Dashboard aggregation queries, CSV/JSON/XLSX
// export, S3 backup trigger. Depends on: @nestjs/core, @nestjs/schedule
// (backup cron), exceljs (export), @aws-sdk/client-s3.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {

	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: "http://localhost",
	});
	const config = new DocumentBuilder()
		.setTitle('Reporting service')
		.setDescription("Reporting API, Prisma, and database backups")
		.setVersion('0.1.0')
		.addBearerAuth()
		.build()
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/reporting/docs', app, document);
	app.useGlobalPipes(new ValidationPipe());
	app.enableShutdownHooks();
	const port = process.env.PORT ?? 3003
	await app.listen(port);
	console.log(`Reporting service is running on port ${port}`)
	console.log(`Swagger documentation: http://localhost:${port}/api/reporting/docs`)
}
bootstrap();

