import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { DatabaseModule } from '../database/database.module';
import { EventsModule } from '../events/events.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guards';
import { ApiKeyThrottlerGuard } from '../auth/api-key-throttler.guard';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [JobsController],
  providers: [JobsService, JwtAuthGuard, RolesGuard, ApiKeyThrottlerGuard],
  exports: [JobsService],
})
export class JobsModule {}
