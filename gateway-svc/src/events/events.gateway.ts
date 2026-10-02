import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcasts real-time job status lifecycle events to all connected clients.
   * Events conform to the Groundswell WebSocket Event Contract:
   *  - job:queued  -> { "job_id": "UUID", "status": "queued" }
   *  - job:running -> { "job_id": "UUID", "status": "running" }
   *  - job:done    -> { "job_id": "UUID", "status": "done", "report_id": "UUID" }
   *  - job:failed  -> { "job_id": "UUID", "status": "failed" }
   */
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
      // Also emit a generic job:update event for convenience
      this.server.emit('job:update', payload);
    }
  }
}
