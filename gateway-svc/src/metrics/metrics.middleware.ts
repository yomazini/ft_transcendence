import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { httpDuration, httpRequests } from './metrics';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl === '/metrics') return next();

    const end = httpDuration.startTimer();
    res.on('finish', () => {
      const labels = {
        method: req.method,
        route: req.route?.path ?? 'unmatched',
        status: String(res.statusCode),
      };
      httpRequests.inc(labels);
      end(labels);
    });
    next();
  }
}
