import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { CreateJobDto } from './dto/create-job.dto';
import { ServiceUnavailableException } from '@nestjs/common';
import { GatewayTimeoutException } from '@nestjs/common';
import {
  DatabaseService,
  JobRecord,
  ReportRecord,
} from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { AuthenticatedUser } from '../auth/jwt-auth.guard';
import { jobCreated } from '../metrics/metrics';
import { UpdateJobDto } from './dto/update-job.dto';

/** Values of the JobModes enum in the shared database (owned by reporting-svc). */
const JOB_MODES: Record<string, string> = {
  keyword: 'Keyword',
  subreddit: 'Subreddit',
  post: 'Post',
  user: 'User',
};

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
      this.logger.log(
        `Connected BullMQ to Redis at ${host}:${port} on queue [scrape-job]`,
      );
    } catch (err: any) {
      this.logger.warn(
        `Redis connection failed: ${err.message}. Using resilient fallback queue.`,
      );
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
      mode: JOB_MODES[dto.mode.toLowerCase()],
      status: 'Queued',
      customer_persona: dto.customer_persona || {
        description: 'general market demographic',
        price_sensitivity: 'budget',
        top_priority: 'cost_saving',
      },
      created_at: now,
    };

    // 1. Persist to PostgreSQL (or in-memory fallback)
    await this.databaseService.saveJob(jobRecord);
    jobCreated.inc();

    // 2. Push task to Redis BullMQ queue (consumed by Madani's scraper-svc)
    if (!this.scrapeQueue) {
      await this.databaseService.updateJobStatus(jobId, 'failed');
      throw new ServiceUnavailableException('scrape queue unavailable');
    }

    let queueTimer: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        this.scrapeQueue.add(
          'scrape',
          {
            id: jobId,
            target: dto.target,
            mode: dto.mode.toLowerCase(),
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
        ),
        new Promise((_, reject) => {
          queueTimer = setTimeout(
            () => reject(new Error('queue timeout')),
            3000,
          );
        }),
      ]);
      this.logger.log(`Enqueued job ${jobId} to BullMQ queue [scrape-job]`);
    } catch (err: any) {
      this.logger.warn(`Failed to enqueue job ${jobId}: ${err.message}`);
      await this.databaseService.updateJobStatus(jobId, 'failed');
      throw new ServiceUnavailableException('could not enqueue job');
    } finally {
      if (queueTimer) clearTimeout(queueTimer);
    }

    // 3. Broadcast real-time WebSocket event (to Next.js frontend)
    void this.eventsGateway.broadcastJobStatus(jobId, 'queued');

    return jobRecord;
  }

  /** Ask analysis-svc a question about one job's comments (semantic search + answer).
   *  The job must belong to the caller's organization: analysis-svc has no auth of its own. */
  async ragQuery(jobId: string, query: string, user: AuthenticatedUser) {
    await this.getJobById(jobId, user); // 404 for a job of another organization
    const base = process.env.ANALYSIS_SVC_URL || 'http://analysis-svc:8001';

    let response: Response;
    try {
      response = await fetch(`${base}/rag/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, query }),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (err: any) {
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        throw new GatewayTimeoutException('analysis-svc timed out');
      }
      throw new HttpException('analysis-svc unreachable', 502);
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new HttpException(
        data?.detail ?? 'analysis-svc could not answer',
        response.status,
      );
    }
    return data;
  }

  async listJobs(user: AuthenticatedUser): Promise<JobRecord[]> {
    return this.databaseService.findJobsByOrg(user.org_id);
  }

  async updateJob(id: string, dto: UpdateJobDto, user: AuthenticatedUser) {
    await this.getJobById(id, user);
    await this.databaseService.updateJob(id, user.org_id, {
      target: dto.target,
      mode: dto.mode ? JOB_MODES[dto.mode.toLowerCase()] : undefined,
      customer_persona: dto.customer_persona,
    });
    return this.getJobById(id, user);
  }

  async deleteJob(id: string, user: AuthenticatedUser): Promise<void> {
    await this.getJobById(id, user);

    await this.databaseService.deleteJob(id, user.org_id);
  }

  async getJobById(id: string, user: AuthenticatedUser): Promise<JobRecord> {
    const job = await this.databaseService.findJobById(id);
    // A job of another organization answers like a missing one (no BOLA leak).
    if (!job || job.org_id !== user.org_id) {
      throw new NotFoundException(`No job found with ID ${id}`);
    }
    return job;
  }

  async getReportByJobId(
    id: string,
    user: AuthenticatedUser,
  ): Promise<ReportRecord> {
    await this.getJobById(id, user); // 404 unless the job belongs to the caller's org
    const report = await this.databaseService.findReportByJobId(id);
    if (!report) {
      throw new NotFoundException(`No report found for job ID ${id}`);
    }
    return report;
  }
}
