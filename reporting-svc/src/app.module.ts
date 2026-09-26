import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ReportingModule } from './reporting/reporting.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ReportingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
