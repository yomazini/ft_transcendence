import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ProxyService } from './proxy.service';

@Module({
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule implements NestModule {
  constructor(private readonly proxyService: ProxyService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        if (req.originalUrl.startsWith('/api/auth') || req.originalUrl.startsWith('/api/orgs')) {
          this.proxyService.forward(req, res);
        } else {
          next();
        }
      })
      .forRoutes('/api/auth', '/api/orgs');
  }
}
