import { Injectable } from "@nestjs/common";
import {
	Registry,
	collectDefaultMetrics,
	Counter,
	Histogram,
	Gauge,
} from "prom-client";

@Injectable()
export class MetricsService {
	constructor() {
		collectDefaultMetrics({ register: this.register });
	}

	readonly register = new Registry();

	readonly httpRequests = new Counter({
		name: "reporting_http_requests_total",
		help: "Total HTTP requests",
		labelNames: ["method", "route", "status"],
		registers: [this.register],
	});

	readonly httpDuration = new Histogram({
		name: "reporting_http_request_duration_seconds",
		help: "HTTP request duration in seconds",
		labelNames: ["method", "route", "status"],
		buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
		registers: [this.register],
	});

	readonly totalExport = new Counter({
		name: "reporting_exports_total",
		help: "tatal reporting exports",
		labelNames: ["format"],
		registers: [this.register],
	});

	readonly lastBackup = new Gauge({
		name: "reporting_last_backup_timestamp_seconds",
		help: "time of the last back up for Database",
		registers: [this.register],
	});

	readonly backupDuration = new Histogram({
		name: "reporting_backup_duration_seconds",
		help: "the backup duraion",
		labelNames: ["method", "route", "status"],
		buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
		registers: [this.register],
	});

	readonly backupTotale = new Counter({
		name: "reporting_backups_total",
		help: "tatal backups",
		labelNames: ["result"],
		registers: [this.register],
	});
}
