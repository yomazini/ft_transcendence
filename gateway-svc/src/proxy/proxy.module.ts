import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ProxyService } from './proxy.service';

const windowMs = 60_000;
const limit = 10;
const hits = new Map<string, { count: number; reset: number }>();

function isLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

function isAuthWrite(req: Request): boolean {
  return (
    req.method === 'POST' &&
    (req.originalUrl.startsWith('/api/auth/login') ||
      req.originalUrl.startsWith('/api/auth/signup') ||
      // Rate-limit 2FA code verification too.
      req.originalUrl.startsWith('/api/auth/2fa/verify') ||
      req.originalUrl.startsWith('/api/auth/forgot-password'))
  );
}

@Module({
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule implements NestModule {
  constructor(private readonly proxyService: ProxyService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        if (
          req.originalUrl.startsWith('/api/auth') ||
          req.originalUrl.startsWith('/api/orgs')
        ) {
          // nginx sends X-Forwarded-For; req.ip uses it.
          const ip = req.ip || 'unknown';
          if (isAuthWrite(req) && isLimited(ip)) {
            res.status(429).json({
              statusCode: 429,
              message: 'Too many auth requests, try again later',
            });
            return;
          }

          this.proxyService.forward(req, res);
        } else {
          next();
        }
      })
      .forRoutes('/api/auth', '/api/orgs');
  }
}
