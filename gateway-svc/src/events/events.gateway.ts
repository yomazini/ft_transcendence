import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { wsConnections } from '../metrics/metrics';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost',
  },
})
export class EventsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private subscriber: Redis | null = null;
  private readonly jwt = new JwtService({ secret: process.env.JWT_SECRET });

  constructor(private readonly databaseService: DatabaseService) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const host = process.env.REDIS_HOST || 'redis';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.subscriber = new Redis({
      host,
      port,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
    this.subscriber.on('error', (err) => {
      this.logger.warn(`Redis subscriber error: ${err.message}`);
    });
    this.subscriber.on('message', (channel, message) => {
      if (channel !== 'job-events') return;
      try {
        const data = JSON.parse(message);
        const { job_id, status, ...extra } = data;
        if (job_id && status) {
          // Scraper failures also update the database.
          if (status === 'failed') {
            // Persist Failed without blocking Redis.
            void this.databaseService.updateJobStatus(job_id, 'failed');
          }
          // Push live event, do not wait.
          void this.broadcastJobStatus(job_id, status, extra);
        }
      } catch {
        this.logger.warn(`Invalid job-events payload: ${message}`);
      }
    });
    // ioredis reconnects automatically; subscribe again whenever it is ready.
    this.subscriber.on('ready', () => {
      void this.subscriber
        ?.subscribe('job-events')
        .then(() => this.logger.log('Subscribed to job-events'))
        .catch((err) =>
          this.logger.warn(`Could not subscribe to job-events: ${err.message}`),
        );
    });
  }

  async onModuleDestroy() {
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }
  }

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }
  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload: any = this.jwt.verify(token);
      if (!payload.sub || !payload.org_id) throw new Error('invalid payload');
      const authSvcUrl = process.env.AUTH_SVC_URL || 'http://auth-svc:3002';
      const res = await fetch(`${authSvcUrl}/auth/verify`, {
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(1500),
      });
      if (res.status == 401 || res.status == 403) {
        client.disconnect();
        return;
      }
      client.data.user = payload;
      await client.join(payload.org_id);
      wsConnections.inc();
      this.logger.log(`Client connected: ${client.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async broadcastJobStatus(
    jobId: string,
    status: 'queued' | 'running' | 'done' | 'failed',
    extraData?: Record<string, any>,
  ) {
    const payload = { job_id: jobId, status, ...extraData };
    const job = await this.databaseService.findJobById(jobId);
    if (!job) {
      this.logger.warn(`No job ${jobId}; skipping WebSocket emit`);
      return;
    }

    if (!this.server) {
      this.logger.warn('WebSocket server not initialized; skipping emit');
      return;
    }

    this.server.to(job.org_id).emit(`job:${status}`, payload);
    this.server.to(job.org_id).emit('job:update', payload);
  }
}
