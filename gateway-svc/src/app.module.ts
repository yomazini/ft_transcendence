import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
    DatabaseModule,
    EventsModule,
    JobsModule,
  ],
})
export class AppModule {}
