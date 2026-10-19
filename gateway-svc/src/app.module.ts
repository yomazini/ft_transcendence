import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { JobsModule } from './jobs/jobs.module';
import { MetricsModule } from './metrics/metrics.module';
import { ProxyModule } from './proxy/proxy.module';

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
<<<<<<< HEAD
    MetricsModule,
=======
>>>>>>> b60c46d (feat(gateway): proxy auth and orgs routes to auth-svc and route through nginx)
    ProxyModule,
  ],
})
export class AppModule {}
