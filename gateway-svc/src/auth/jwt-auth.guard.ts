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

  canActivate(context: ExecutionContext): boolean {
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

    // The token must be signed by auth-svc with the shared JWT_SECRET.
    // Tokens that carry a `purpose` (signup, invite, reset) are not login tokens.
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (payload.purpose || !payload.sub || !payload.org_id) {
      throw new UnauthorizedException('Invalid token');
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
