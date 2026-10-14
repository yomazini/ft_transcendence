import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ReportingModule } from './reporting/reporting.module';
import { S3Module } from './s3/s3.module';
import { MinioModule } from './minio/minio.module';
import awsConfig from './s3/aws.config';
import { BackupsModule } from './backups/backups.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [awsConfig],
			envFilePath: '.env.example',
		}),
		ReportingModule,
		S3Module,
		MinioModule,
		BackupsModule,
		ScheduleModule.forRoot(),
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}