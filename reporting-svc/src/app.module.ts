import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReportingModule } from './reporting/reporting.module';
import { MinioModule } from './minio/minio.module';
import { BackupsModule } from './backups/backups.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env.example',
		}),
		ReportingModule,
		MinioModule,
		BackupsModule,
		ScheduleModule.forRoot(),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}