import { Module } from "@nestjs/common";
import { ReportingService } from "./reporting.service";
import { ReportingController } from "./reporting.controller";
import { MetricsModule } from "src/metrics/metrics.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports: [MetricsModule, PrismaModule],
	controllers: [ReportingController],
	providers: [ReportingService],
})
export class ReportingModule {}
