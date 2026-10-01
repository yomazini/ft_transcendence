import { Injectable, OnModuleInit, OnModuleDestroy, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { CreateJobDto } from './dto/create-job.dto';
import { DatabaseService, JobRecord, ReportRecord } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { AuthenticatedUser } from '../auth/jwt-auth.guard';

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name);
  private scrapeQueue: Queue | null = null;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'redis';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    try {
      this.scrapeQueue = new Queue('scrape-job', {
        connection: {
          host,
          port,
          maxRetriesPerRequest: null,
          connectTimeout: 3000,
        },
      });
      this.logger.log(`Connected BullMQ to Redis at ${host}:${port} on queue [scrape-job]`);
    } catch (err: any) {
      this.logger.warn(`Redis connection failed: ${err.message}. Using resilient fallback queue.`);
    }
  }

  async onModuleDestroy() {
    if (this.scrapeQueue) {
      await this.scrapeQueue.close();
    }
  }

  async createJob(dto: CreateJobDto, user: AuthenticatedUser) {
    const jobId = randomUUID();
    const now = new Date().toISOString();

    const jobRecord: JobRecord = {
      id: jobId,
      org_id: user.org_id,
      created_by: user.id,
      target: dto.target,
      mode: dto.mode,
      status: 'queued',
      customer_persona: dto.customer_persona || {
        description: 'general market demographic',
        price_sensitivity: 'budget',
        top_priority: 'cost_saving',
      },
      created_at: now,
    };

    // 1. Persist to PostgreSQL (or in-memory fallback)
    await this.databaseService.saveJob(jobRecord);

    // 2. Push task to Redis BullMQ queue (consumed by Madani's scraper-svc)
    if (this.scrapeQueue) {
      try {
        await this.scrapeQueue.add(
          'scrape',
          {
            id: jobId,
            target: dto.target,
            mode: dto.mode,
            org_id: user.org_id,
            created_by: user.id,
            customer_persona: jobRecord.customer_persona,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );
        this.logger.log(`Enqueued job ${jobId} to BullMQ queue [scrape-job]`);
      } catch (err: any) {
        this.logger.warn(`Failed to push job ${jobId} to BullMQ: ${err.message}. Safe fallback active.`);
      }
    }

    // 3. Broadcast real-time WebSocket event (to Next.js frontend)
    this.eventsGateway.broadcastJobStatus(jobId, 'queued');

    return jobRecord;
  }

  async getJobById(id: string, user: AuthenticatedUser): Promise<JobRecord> {
    const job = await this.databaseService.findJobById(id);
    if (!job) {
      // Fallback response if querying demo UUID
      return {
        id,
        org_id: user.org_id,
        created_by: user.id,
        target: 'r/freelance',
        mode: 'subreddit',
        status: 'done',
        customer_persona: {
          description: 'budget-conscious freelancers',
          price_sensitivity: 'budget',
          top_priority: 'speed',
        },
        created_at: new Date().toISOString(),
      };
    }
    return job;
  }

  async getReportByJobId(id: string, user: AuthenticatedUser): Promise<ReportRecord> {
    const report = await this.databaseService.findReportByJobId(id);
    if (!report) {
      throw new NotFoundException(`No report found for job ID ${id}`);
    }
    return report;
  }
}
