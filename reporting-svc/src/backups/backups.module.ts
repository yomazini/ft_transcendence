import { Module } from "@nestjs/common";
import { BackupsService } from "./backups.service";
import { BackupsController } from "./backups.controller";
import { MinioModule } from "src/minio/minio.module";
import { MetricsModule } from "src/metrics/metrics.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
	imports: [MinioModule, MetricsModule, PrismaModule],
	controllers: [BackupsController],
	providers: [BackupsService],
})
export class BackupsModule {}
