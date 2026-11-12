import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guards';

function makeContext(user?: { role: string }) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any;
}

function makeGuard(roles?: string[]) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(roles),
  } as any;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('passes when the route has no @Roles metadata', () => {
    expect(makeGuard(undefined).canActivate(makeContext(undefined))).toBe(true);
  });

  it('allows Admin on an Admin/Analyst route', () => {
    expect(
      makeGuard(['Admin', 'Analyst']).canActivate(
        makeContext({ role: 'Admin' }),
      ),
    ).toBe(true);
  });

  it('allows Analyst on an Admin/Analyst route', () => {
    expect(
      makeGuard(['Admin', 'Analyst']).canActivate(
        makeContext({ role: 'Analyst' }),
      ),
    ).toBe(true);
  });

  it('blocks Viewer on an Admin/Analyst route', () => {
    expect(() =>
      makeGuard(['Admin', 'Analyst']).canActivate(
        makeContext({ role: 'Viewer' }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('blocks Analyst on an Admin-only route', () => {
    expect(() =>
      makeGuard(['Admin']).canActivate(makeContext({ role: 'Analyst' })),
    ).toThrow(ForbiddenException);
  });

  it('blocks a request with no user', () => {
    expect(() =>
      makeGuard(['Admin']).canActivate(makeContext(undefined)),
    ).toThrow(ForbiddenException);
  });
});
