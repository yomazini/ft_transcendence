import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';

export interface AuthenticatedUser {
  id: string;
  org_id: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwt = new JwtService({ secret: process.env.JWT_SECRET });

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
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
    } catch (err: any) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
    }

    request.user = {
      id: payload.sub,
      org_id: payload.org_id,
      email: payload.email ?? '',
      role: payload.role,
    } as AuthenticatedUser;

    return true;
  }
}
