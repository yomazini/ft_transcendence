import {
  Counter,
  collectDefaultMetrics,
  Histogram,
  register,
} from 'prom-client';

collectDefaultMetrics();

export const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],

  buckets: [0.01, 0.05, 0.1, 0.3, 1, 3],
});

export const jobCreated = new Counter({
  name: 'gateway_jobs_created_total',
  help: 'job created',
});

export const wsConnections = new Counter({
  name: 'gateway_ws_connections_total',
  help: 'WebSocket connections',
});

export { register };
