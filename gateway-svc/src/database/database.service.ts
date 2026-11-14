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
  created_by: string | null;
  target: string;
  name: string;
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

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    const host = process.env.POSTGRES_HOST || 'postgres';
    const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
    const user = process.env.POSTGRES_USER || 'ft_transcendence';
    const password = process.env.POSTGRES_PASSWORD;
    const database = process.env.POSTGRES_DB || 'ft_transcendence';

    this.pool = new Pool({
      host,
      port,
      user,
      password,
      database,
      connectionTimeoutMillis: 3000,
    });

    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log(`Connected to PostgreSQL at ${host}:${port}/${database}`);
    } catch (err: any) {
      await this.pool.end().catch(() => undefined);
      this.pool = null;
      throw new ServiceUnavailableException(
        `database unavailable: ${err.message}`,
      );
    }
  }

  private get db(): Pool {
    if (!this.pool) {
      throw new ServiceUnavailableException('database unavailable');
    }
    return this.pool;
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /** Used when a service that has no database access (scraper-svc) reports a failure. */
  async updateJobStatus(id: string, status: string): Promise<void> {
    await this.db.query('UPDATE "Job" SET status = $1 WHERE id = $2;', [
      this.normalizeJobStatus(status),
      id,
    ]);
  }

  async findOrganizationDescription(orgId: string): Promise<string | null> {
    const res = await this.db.query(
      `SELECT description FROM "Organization" WHERE id = $1`,
      [orgId],
    );
    return res.rows[0]?.description ?? null;
  }

  /** The latest jobs of one organization, newest first (dashboard job list). */
  async findJobsByOrg(orgId: string, limit = 50): Promise<JobRecord[]> {
    const res: QueryResult = await this.db.query(
      `SELECT id, org_id, target, name, mode, status, customer_persona, created_at
         FROM "Job" WHERE org_id = $1 ORDER BY created_at DESC LIMIT $2;`,
      [orgId, limit],
    );
    return res.rows.map((row) => ({
      id: row.id,
      org_id: row.org_id,
      created_by: null,
      target: row.target,
      name: row.name,
      mode: String(row.mode).toLowerCase(),
      status: String(row.status).toLowerCase(),
      customer_persona: row.customer_persona,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    }));
  }

  async saveJob(job: JobRecord): Promise<void> {
    await this.db.query(
      `INSERT INTO "Job"
      (id, org_id, target, name, mode, status, customer_persona, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
      [
        job.id,
        job.org_id,
        job.target,
        job.name,
        this.normalizeJobMode(job.mode),
        this.normalizeJobStatus(job.status),
        JSON.stringify(job.customer_persona),
        new Date(job.created_at),
      ],
    );
  }

  async updateJob(id: string, orgId: string, name: string): Promise<void> {
    await this.db.query(
      `UPDATE "Job" SET name = $1 WHERE id = $2 AND org_id = $3;`,
      [name, id, orgId],
    );
  }

  async deleteJob(id: string, orgId: string): Promise<void> {
    await this.db.query('DELETE FROM "Job" WHERE id = $1 AND org_id = $2;', [
      id,
      orgId,
    ]);
  }

  async findJobById(id: string): Promise<JobRecord | null> {
    const res: QueryResult = await this.db.query(
      `SELECT id, org_id, target, name, mode, status, customer_persona, created_at FROM "Job" WHERE id = $1;`,
      [id],
    );
    if (res.rows.length === 0) {
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      org_id: row.org_id,
      created_by: null,
      target: row.target,
      name: row.name,
      mode: row.mode,
      status: String(row.status).toLowerCase(),
      customer_persona: row.customer_persona,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    };
  }

  async findReportByJobId(jobId: string): Promise<ReportRecord | null> {
    const res: QueryResult = await this.db.query(
      `SELECT id, job_id, swot, blue_ocean, conclusion, created_at FROM "Report" WHERE job_id = $1 OR id = $1 ORDER BY created_at DESC LIMIT 1;`,
      [jobId],
    );
    if (res.rows.length === 0) {
      return null;
    }
    return this.mapReport(res.rows[0]);
  }

  private mapReport(row: any): ReportRecord {
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

  private normalizeJobMode(mode: string): string {
    const map: Record<string, string> = {
      keyword: 'Keyword',
      subreddit: 'Subreddit',
      post: 'Post',
      user: 'User',
    };
    return map[mode.toLowerCase()] || 'Subreddit';
  }

  async findApiKeyByHash(hash: string) {
    const res = await this.db.query(
      `SELECT user_id, org_id FROM "ApiKey" WHERE key_hash = $1  AND active= true LIMIT 1`,
      [hash],
    );
    return res.rows[0] ?? null;
  }

  async touchApiKey(hash: string) {
    await this.db.query(
      `UPDATE "ApiKey" SET last_used_at = now() WHERE key_hash=$1 `,
      [hash],
    );
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
}
