import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsService } from '../metrics.service';
import { Request, Response } from 'express'
import { finalize } from 'rxjs';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
	constructor(private readonly metrics: MetricsService) {}
	intercept(context: ExecutionContext, next: CallHandler): Observable<any>{
		if (context.getType() !== 'http') {
			return (next.handle())
		}

		const request = context.switchToHttp().getRequest<Request>();
		const response = context.switchToHttp().getResponse<Response>();

		const start = performance.now();

		const finale = next.handle().pipe(
			finalize(() => {
				if (request.path === '/metrics') {
					return ;
				}
				const route = request.route?.path ? `${request.baseUrl}${request.route.path}` : "unknown";
				const labels = {
					method: request.method,
					route,
					status: String(response.statusCode)
				}
				const duration = (performance.now() - start) / 1000;
				this.metrics.httpRequests.inc(labels);
				this.metrics.httpDuration.observe(labels, duration);
			})
		)
		return finale;
	}
}
