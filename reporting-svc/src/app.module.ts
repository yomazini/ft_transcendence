import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ReportingModule } from './reporting/reporting.module';
import { S3Module } from './s3/s3.module';
import awsConfig from './s3/aws.config';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [awsConfig],
			envFilePath: '.env.example',
		}),
		ReportingModule,
		S3Module,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}