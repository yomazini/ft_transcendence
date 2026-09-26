// reporting-svc — NestJS. Dashboard aggregation queries, CSV/JSON/XLSX
// export, S3 backup trigger. Depends on: @nestjs/core, @nestjs/schedule
// (backup cron), exceljs (export), @aws-sdk/client-s3.
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();

