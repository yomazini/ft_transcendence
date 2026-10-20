import { Injectable, NestMiddleware } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

/** Middleware = a function that runs on every request before NestJS routes it to a guard or controller.
 * request → [✅ middleware] → guard → interceptor → pipe → controller → response

 */

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
	constructor(private readonly metrics: MetricsService) {}

	use(req: any, res:any, next: () => void) {
		if (req.originalUrl === '/metrics') { return next(); }

		const end = this.metrics.httpDuration.startTimer();

		/** res.on(event, callback) 
		 * = when this event happens on the response, run this function
		*/
		res.on('finish', () => {
			const labels = { method: req.method, route: req.route?.path ?? 'unmatched', status: res.statusCode };
			this.metrics.httpRequests.inc(labels);
			end(labels);
		});
		next();
	}
}
