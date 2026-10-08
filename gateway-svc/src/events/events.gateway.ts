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

@WebSocketGateway({
  cors: {
    origin: '*',
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

  async onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const host = process.env.REDIS_HOST || 'redis';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.subscriber = new Redis({ host, port, lazyConnect: true });
    this.subscriber.on('error', (err) => {
      this.logger.warn(`Redis subscriber error: ${err.message}`);
    });

    try {
      await this.subscriber.connect();
      await this.subscriber.subscribe('job-events');
      this.subscriber.on('message', (channel, message) => {
        if (channel !== 'job-events') return;
        try {
          const data = JSON.parse(message);
          const { job_id, status, ...extra } = data;
          if (job_id && status) {
            this.broadcastJobStatus(job_id, status, extra);
          }
        } catch {
          this.logger.warn(`Invalid job-events payload: ${message}`);
        }
      });
    } catch (err: any) {
      this.logger.warn(`Could not subscribe to job-events: ${err.message}`);
    }
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

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastJobStatus(
    jobId: string,
    status: 'queued' | 'running' | 'done' | 'failed',
    extraData?: Record<string, any>,
  ) {
    const payload = {
      job_id: jobId,
      status,
      ...extraData,
    };

    const eventName = `job:${status}`;
    this.logger.log(
      `Emitting WebSocket event [${eventName}]: ${JSON.stringify(payload)}`,
    );

    if (this.server) {
      this.server.emit(eventName, payload);
      this.server.emit('job:update', payload);
    }
  }
}
