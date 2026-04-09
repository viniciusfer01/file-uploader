import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

function createContext(authorization?: string): ExecutionContext {
  return {
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authorization ? { authorization } : {},
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const reflector = {
    getAllAndOverride: vi.fn(),
  };

  const authService = {
    verifyToken: vi.fn(),
  };

  const guard = new AuthGuard(reflector as unknown as Reflector, authService as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows public routes', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('rejects requests without bearer token', () => {
    reflector.getAllAndOverride.mockReturnValue(false);

    expect(() => guard.canActivate(createContext())).toThrow(UnauthorizedException);
  });

  it('attaches the authenticated user for protected routes', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    authService.verifyToken.mockReturnValue({ email: 'admin@example.com' });
    const request = { headers: { authorization: 'Bearer token' } };
    const context = {
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(authService.verifyToken).toHaveBeenCalledWith('token');
    expect(request).toMatchObject({
      user: { email: 'admin@example.com' },
    });
  });
});
