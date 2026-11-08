import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ServiceUnavailableException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './public.decorator';
import { DatabaseService } from '../database/database.service';

export interface AuthenticatedUser {
  id: string;
  org_id: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwt = new JwtService({ secret: process.env.JWT_SECRET });

  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const raw = request.headers['x-api-key'];
    if (raw) {
      const hash = createHash('sha256').update(String(raw)).digest('hex');
      const key = await this.databaseService.findApiKeyByHash(hash);
      if (!key) throw new UnauthorizedException('Invalid API key');
      request.user = { id: key.user_id, org_id: key.org_id, role: 'Admin' };
      void this.databaseService.touchApiKey(hash).catch(() => undefined);
      return true;
    }

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException(
        'Missing authorization token. Provide Bearer <token>',
      );
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid authorization header format. Expected Bearer <token>',
      );
    }

    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.purpose || !payload.sub || !payload.org_id) {
      throw new UnauthorizedException('Invalid token');
    }

    const authSvcUrl = process.env.AUTH_SVC_URL || 'http://auth-svc:3002';
    try {
      const verifyRes = await fetch(`${authSvcUrl}/auth/verify`, {
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(1500),
      });
      if (verifyRes.status === 401 || verifyRes.status === 403) {
        throw new UnauthorizedException('Token has been revoked or logged out');
      }
      if (!verifyRes.ok)
        throw new ServiceUnavailableException('auth-svc verify failed');
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new ServiceUnavailableException('auth-svc unreachable');
    }

    request.user = {
      id: payload.sub,
      org_id: payload.org_id,
      role: payload.role,
    };

    return true;
  }
}
