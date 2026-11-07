import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guards';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [JobsController],
  providers: [JobsService, JwtAuthGuard, RolesGuard],
  exports: [JobsService],
})
export class JobsModule {}
