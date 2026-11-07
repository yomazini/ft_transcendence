import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { ApiKeyThrottlerGuard } from './api-key-throttler.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

function contextWith(headers: Record<string, string>) {
  const request = { headers, ip: '127.0.0.1' } as any;
  return {
    request,
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as any;
}

function reflector(publicRoute = false) {
  return {
    getAllAndOverride: jest.fn().mockReturnValue(publicRoute),
  } as any;
}

describe('JwtAuthGuard API key branch', () => {
  it('accepts a valid key and attaches the organization Admin context', async () => {
    const database = {
      findApiKeyByHash: jest
        .fn()
        .mockResolvedValue({ user_id: 'u-1', org_id: 'o-1' }),
      touchApiKey: jest.fn().mockResolvedValue(undefined),
    };
    const guard = new JwtAuthGuard(reflector(), database as any);
    const context = contextWith({ 'x-api-key': 'if_valid' });
    const request = context.request;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'u-1',
      org_id: 'o-1',
      role: 'Admin',
    });
    expect(database.touchApiKey).toHaveBeenCalledWith(
      createHash('sha256').update('if_valid').digest('hex'),
    );
  });

  it('rejects an unknown or revoked key', async () => {
    const database = {
      findApiKeyByHash: jest.fn().mockResolvedValue(null),
      touchApiKey: jest.fn(),
    };
    const guard = new JwtAuthGuard(reflector(), database as any);

    await expect(
      guard.canActivate(contextWith({ 'x-api-key': 'if_revoked' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('ApiKeyThrottlerGuard', () => {
  const guard = new ApiKeyThrottlerGuard(
    {} as any,
    {} as any,
    {} as any,
  );

  it('tracks by the key hash, not the IP', async () => {
    const tracker = await (guard as any).getTracker({
      headers: { 'x-api-key': 'if_abc' },
      ip: '10.0.0.1',
    });

    expect(tracker).toBe(
      createHash('sha256').update('if_abc').digest('hex'),
    );
  });

  it('falls back to the IP for JWT requests', async () => {
    const tracker = await (guard as any).getTracker({
      headers: {},
      ip: '10.0.0.1',
    });

    expect(tracker).toBe('10.0.0.1');
  });
});
