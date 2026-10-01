import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ReportingModule } from './reporting/reporting.module';
import { S3Module } from './s3/s3.module';
import awsConfig from './s3/aws.config';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), ReportingModule, S3Module, 
				ConfigModule.forRoot({
				load: [awsConfig],
				isGlobal: true,
				}),],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}