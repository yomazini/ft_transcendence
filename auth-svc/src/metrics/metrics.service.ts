import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter } from 'prom-client';

@Injectable()
export class MetricsService {
	readonly register = new Registry(); 
	readonly httpRequests = new Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['method', 'route', 'status'], registers: [this.register] });
	constructor() {
		collectDefaultMetrics({ register: this.register });
	}
}
