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
    return next.handle().pipe(
		tap(() => this.metrics.httpRequests.inc({ method: req.method, route: req.route?.path ?? 'unknown', status: res.statusCode })),
		catchError((err) => {
			this.metrics.httpRequests.inc({ method: req.method, route: req.route?.path ?? 'unknown', status: err.getStatus?.() ?? 500 });
		return throwError(() => err);
})
	);
  }
}
