import { Injectable, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import http from 'http';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly authSvcUrl =
    process.env.AUTH_SVC_URL || 'http://auth-svc:3002';

  forward(req: Request, res: Response): void {
    const targetUrl = new URL(this.authSvcUrl);
    const targetPath = req.originalUrl.replace(/^\/api\/(auth|orgs)/, '/$1');

    const headers: http.OutgoingHttpHeaders = { ...req.headers };
    delete headers['content-length'];
    headers['host'] = targetUrl.host;
    const prior = req.headers['x-forwarded-for'];
    const remote = req.socket.remoteAddress || '';
    headers['x-forwarded-proto'] = req.protocol || 'http';
    headers['x-forwarded-for'] = prior ? `${prior}, ${remote}` : remote;
    const clientReq = http.request(
      {
        hostname: targetUrl.hostname,
        port: targetUrl.port || 3002,
        path: targetPath,
        method: req.method,
        headers,
      },
      (clientRes) => {
        res.status(clientRes.statusCode || 500);
        for (const [key, val] of Object.entries(clientRes.headers)) {
          if (val !== undefined) {
            res.setHeader(key, val);
          }
        }
        clientRes.pipe(res);
      },
    );

    clientReq.on('error', (err) => {
      this.logger.error(
        `Proxy error forwarding to ${targetPath}: ${err.message}`,
      );
      if (!res.headersSent) {
        res.status(502).json({
          statusCode: 502,
          message: `Bad Gateway: auth-svc unreachable (${err.message})`,
        });
      }
    });

    if (req.body && Object.keys(req.body).length > 0) {
      const payload =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      clientReq.setHeader('content-type', 'application/json');
      clientReq.setHeader('content-length', Buffer.byteLength(payload));
      clientReq.write(payload);
      clientReq.end();
    } else if (req.readable && !req.readableEnded) {
      req.pipe(clientReq);
    } else {
      clientReq.end();
    }
  }
}
