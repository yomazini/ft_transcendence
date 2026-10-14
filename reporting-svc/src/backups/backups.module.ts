import { Module } from '@nestjs/common';
import { BackupsService } from './backups.service';
import { BackupsController } from './backups.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MinioModule } from 'src/minio/minio.module';
import { MinioService } from 'src/minio/minio.service';

@Module({
  imports: [MinioModule],
  controllers: [BackupsController],
  providers: [BackupsService, PrismaService, MinioService],
})

export class BackupsModule {}
