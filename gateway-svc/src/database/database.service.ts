import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

export interface JobRecord {
  id: string;
  org_id: string;
  created_by: string;
  target: string;
  mode: string;
  status: string;
  customer_persona: any;
  created_at: string;
}

export interface ReportRecord {
  id: string;
  job_id: string;
  swot: any;
  blue_ocean: any;
  conclusion: string;
  created_at: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory stub storage for offline development & resilient fallback
  private readonly inMemoryJobs = new Map<string, JobRecord>();
  private readonly inMemoryReports = new Map<string, ReportRecord>();

  constructor() {
    this.seedDefaultStubData();
  }

  private retryTimer?: NodeJS.Timeout;

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const host = process.env.POSTGRES_HOST || 'postgres';
    const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
    const user = process.env.POSTGRES_USER || 'ft_transcendence';
    const password = process.env.POSTGRES_PASSWORD || 'changeme';
    const database = process.env.POSTGRES_DB || 'ft_transcendence';

    try {
      this.pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        connectionTimeoutMillis: 3000,
      });
      const client = await this.pool.connect();
      this.isConnected = true;
      client.release();
      this.logger.log(`Connected to PostgreSQL at ${host}:${port}/${database}`);
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(
        `PostgreSQL not reachable (${err.message}); retrying in 5s`,
      );
      this.retryTimer = setTimeout(() => void this.connect(), 5000);
    }
  }

  async onModuleDestroy() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.pool) {
      await this.pool.end();
    }
  }

  async saveJob(job: JobRecord): Promise<void> {
    if (!this.isProduction) {
      this.inMemoryJobs.set(job.id, job);
    }

    if (!this.isConnected || !this.pool) {
      if (this.isProduction) {
        throw new ServiceUnavailableException('database unavailable');
      }
      return;
    }

    try {
      const query = `
        INSERT INTO "Job" (id, org_id, created_by, target, mode, status, customer_persona, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
      `;
      await this.pool.query(query, [
        job.id,
        job.org_id,
        job.created_by,
        job.target,
        this.normalizeJobMode(job.mode),
        this.normalizeJobStatus(job.status),
        JSON.stringify(job.customer_persona),
        new Date(job.created_at),
      ]);
      this.logger.log(`Persisted Job ${job.id} to PostgreSQL`);
    } catch (err: any) {
      if (this.isProduction) {
        throw new ServiceUnavailableException('could not persist job');
      }
      this.logger.warn(
        `Failed to persist Job to DB: ${err.message}. Retained in in-memory store.`,
      );
    }
  }

  private get isProduction(): boolean {
    return process.env.NODE_ENV == 'production';
  }

  /** Used when a service that has no database access (scraper-svc) reports a failure. */
  async updateJobStatus(id: string, status: string): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      await this.pool.query('UPDATE "Job" SET status = $1 WHERE id = $2;', [
        this.normalizeJobStatus(status),
        id,
      ]);
    } catch (err: any) {
      this.logger.warn(`Failed to update status of job ${id}: ${err.message}`);
    }
  }

  async findOrganizationDescription(orgId: string): Promise<string | null> {
    if (!this.isConnected || !this.pool) return null;
    try {
      const res = await this.pool.query(
        `SELECT description FROM "Organization" WHERE id = $1`,
        [orgId],
      );
      return res.rows[0]?.description ?? null;
    } catch (err: any) {
      this.logger.warn(
        `Failed to read organization ${orgId} description: ${err.message}`,
      );
      return null;
    }
  }
  /** The latest jobs of one organization, newest first (dashboard job list). */
  async findJobsByOrg(orgId: string, limit = 50): Promise<JobRecord[]> {
    if (!this.isConnected || !this.pool) return [];
    try {
      const res: QueryResult = await this.pool.query(
        `SELECT id, org_id, created_by, target, mode, status, customer_persona, created_at
           FROM "Job" WHERE org_id = $1 ORDER BY created_at DESC LIMIT $2;`,
        [orgId, limit],
      );
      return res.rows.map((row) => ({
        id: row.id,
        org_id: row.org_id,
        created_by: row.created_by,
        target: row.target,
        mode: String(row.mode).toLowerCase(),
        status: String(row.status).toLowerCase(),
        customer_persona: row.customer_persona,
        created_at:
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : String(row.created_at),
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to list jobs of org ${orgId}: ${err.message}`);
      return [];
    }
  }

  async updateJob(
    id: string,
    orgId: string,
    fields: {
      target?: string;
      mode?: string;
      customer_persona?: unknown;
    },
  ): Promise<void> {
    const cached = this.inMemoryJobs.get(id);
    if (cached) {
      this.inMemoryJobs.set(id, { ...cached, ...fields });
    }
    if (!this.isConnected || !this.pool) return;

    await this.pool.query(
      `
        UPDATE "Job"
        SET target = COALESCE($1, target),
            mode = COALESCE($2::"JobModes", mode),
            customer_persona = COALESCE($3::jsonb, customer_persona)
        WHERE id = $4 AND org_id = $5;
      `,
      [
        fields.target ?? null,
        fields.mode ?? null,
        fields.customer_persona
          ? JSON.stringify(fields.customer_persona)
          : null,
        id,
        orgId,
      ],
    );
  }

  async deleteJob(id: string, orgId: string): Promise<void> {
    this.inMemoryJobs.delete(id);
    this.inMemoryReports.delete(id);

    if (!this.isConnected || !this.pool) return;

    await this.pool.query('DELETE FROM "Job" WHERE id = $1 AND org_id = $2;', [
      id,
      orgId,
    ]);
  }

  async findJobById(id: string): Promise<JobRecord | null> {
    if (this.isConnected && this.pool) {
      try {
        const res: QueryResult = await this.pool.query(
          `SELECT id, org_id, created_by, target, mode, status, customer_persona, created_at FROM "Job" WHERE id = $1;`,
          [id],
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            org_id: row.org_id,
            created_by: row.created_by,
            target: row.target,
            mode: row.mode,
            status: String(row.status).toLowerCase(),
            customer_persona: row.customer_persona,
            created_at:
              row.created_at instanceof Date
                ? row.created_at.toISOString()
                : String(row.created_at),
          };
        }
      } catch (err: any) {
        this.logger.warn(
          `Postgres lookup failed: ${err.message}. Falling back to in-memory store.`,
        );
      }
    }

    return this.inMemoryJobs.get(id) || null;
  }

  async findReportByJobId(jobId: string): Promise<ReportRecord | null> {
    if (this.isConnected && this.pool) {
      try {
        const res: QueryResult = await this.pool.query(
          `SELECT id, job_id, swot, blue_ocean, conclusion, created_at FROM "Report" WHERE job_id = $1 OR id = $1;`,
          [jobId],
        );
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            job_id: row.job_id,
            swot: row.swot,
            blue_ocean: row.blue_ocean,
            conclusion: row.conclusion,
            created_at:
              row.created_at instanceof Date
                ? row.created_at.toISOString()
                : String(row.created_at),
          };
        }
      } catch (err: any) {
        this.logger.warn(`Postgres report lookup failed: ${err.message}`);
      }
    }

    return this.inMemoryReports.get(jobId) || null;
  }

  private normalizeJobMode(mode: string): string {
    const map: Record<string, string> = {
      keyword: 'Keyword',
      subreddit: 'Subreddit',
      post: 'Post',
      user: 'User',
    };
    return map[mode.toLowerCase()] || 'Subreddit';
  }

  private normalizeJobStatus(status: string): string {
    const map: Record<string, string> = {
      queued: 'Queued',
      running: 'Running',
      done: 'Done',
      failed: 'Failed',
    };
    return map[status.toLowerCase()] || 'Queued';
  }

  private seedDefaultStubData() {
    // Never expose demo jobs/reports in production.
    if (process.env.NODE_ENV === 'production') return;

    const defaultJobId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const seedJobId = 'a18f2d90-3b41-4e2a-9f12-987654321abc';

    const defaultReport: ReportRecord = {
      id: 'c39e4a81-9b12-4f3e-8c3d-123456789abc',
      job_id: defaultJobId,
      swot: {
        strengths: [
          'High organic community praise for responsive customer support',
          'Fast synchronization and reliable offline access',
        ],
        weaknesses: [
          'Mobile application UX feels bloated according to power users',
          'Pricing friction and lack of granular seat-based tiers',
        ],
        opportunities: [
          'Automated topic auto-organization and AI sentiment insights',
          'High demand for verified Reddit comment citation search',
        ],
        threats: [
          'Incumbent SaaS competitors launching bundled LLM features',
          'Users switching to minimal markdown self-hosted tools',
        ],
      },
      blue_ocean: {
        eliminate: [
          'Complex manual database setups',
          'Bloated multi-tier onboarding forms',
        ],
        reduce: [
          'Report generation latency',
          'Cost per analyzed Reddit thread',
        ],
        raise: [
          'Actionable customer sentiment resolution',
          'Traceability to original comments',
        ],
        create: [
          'One-click executive SWOT synthesis',
          'Interactive pgvector semantic chat',
        ],
      },
      conclusion:
        'Users value fast synchronization and clear support, but express dissatisfaction regarding opaque auto-renewals. Strong market opportunity exists for an automated social intelligence dashboard.',
      created_at: new Date().toISOString(),
    };

    this.inMemoryJobs.set(defaultJobId, {
      id: defaultJobId,
      org_id: '018f2d90-3b41-7e2a-9f12-111122223333',
      created_by: '01111111-1111-7111-8111-111111111111',
      target: 'r/freelance',
      mode: 'Subreddit',
      status: 'Done',
      customer_persona: {
        description: 'budget-conscious freelancers',
        price_sensitivity: 'budget',
        top_priority: 'speed',
      },
      created_at: new Date().toISOString(),
    });
    this.inMemoryReports.set(defaultJobId, defaultReport);
    this.inMemoryReports.set(seedJobId, {
      ...defaultReport,
      job_id: seedJobId,
    });
    this.inMemoryReports.set(defaultReport.id, defaultReport);
  }
}
