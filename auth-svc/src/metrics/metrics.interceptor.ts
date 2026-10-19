import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
	constructor(private readonly metrics: MetricsService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const http = context.switchToHttp();
		const req = http.getRequest();
		const res = http.getResponse();
		const end = this.metrics.httpDuration.startTimer();

		const record = (status: number) => {
			const labels = { method: req.method, route: req.route?.path ?? 'unknown', status };
			this.metrics.httpRequests.inc(labels);
			end(labels);
		};
		return next.handle().pipe(
			tap(() => record(res.statusCode)),
			catchError((err) => {
				record(err.getStatus?.() ?? 500);
				return throwError(() => err);
			}),
		);
	}
}
