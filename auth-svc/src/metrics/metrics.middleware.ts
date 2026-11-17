import { Injectable, NestMiddleware } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
	constructor(private readonly metrics: MetricsService) {}

	use(req: any, res:any, next: () => void) {
		if (req.originalUrl === '/metrics') { return next(); }

		const end = this.metrics.httpDuration.startTimer();

		res.on('finish', () => {
			const labels = { method: req.method, route: req.route?.path ?? 'unmatched', status: res.statusCode };
			this.metrics.httpRequests.inc(labels);
			end(labels);
		});
		next();
	}
}
