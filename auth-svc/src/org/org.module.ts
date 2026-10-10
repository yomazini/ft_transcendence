import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [OrgController],
  providers: [OrgService],
  imports: [PrismaModule],
})
export class OrgModule {}
