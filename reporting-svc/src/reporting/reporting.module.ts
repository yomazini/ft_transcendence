import { Module } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MetricsModule } from 'src/metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  controllers: [ReportingController],
  providers: [ReportingService, PrismaService],
})
export class ReportingModule {}
