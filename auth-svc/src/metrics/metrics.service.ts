import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
	constructor() {
		collectDefaultMetrics({ register: this.register });
	}

	readonly register = new Registry();
	
	readonly httpRequests = new Counter({ 
			name: 'http_requests_total',
			help: 'Total HTTP requests',
			labelNames: ['method', 'route', 'status'],
			registers: [this.register] 
		});

	readonly httpDuration = new Histogram({
		name: 'http_request_duration_seconds',
		help: 'HTTP request duration in seconds',
		labelNames: ['method', 'route', 'status'],
		buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5], registers: [this.register] 
	});

	readonly logins = new Counter({
		name: 'auth_logins_total',
		help: 'Login attempts by method and result',
		labelNames: ['method', 'result'],
		registers: [this.register] 
	});

	readonly signups = new Counter({
		name: 'auth_signups_total',
		help: 'Signups by source',
		labelNames: ['source'],
		registers: [this.register] 
	});

	readonly logouts = new Counter({
		name: 'auth_logouts_total',
		help: 'Logouts', registers: [this.register]
	});

	readonly passwordChanges = new Counter({
		name: 'auth_password_changes_total',
		help: 'Password changes by kind',
		labelNames: ['kind'], registers: [this.register]
	});
}
