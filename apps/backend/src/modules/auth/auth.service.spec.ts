import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const configService = {
    get: vi.fn((key: string) => {
      const values: Record<string, string> = {
        AUTH_TOKEN_TTL_MS: '60000',
      };
      return values[key];
    }),
    getOrThrow: vi.fn((key: string) => {
      const values: Record<string, string> = {
        AUTH_EMAIL: 'admin@example.com',
        AUTH_PASSWORD: 'supersecret',
        AUTH_TOKEN_SECRET: 'test-secret',
      };
      return values[key];
    }),
  };

  const service = new AuthService(configService as unknown as ConfigService);

  it('returns a signed token for valid credentials', () => {
    const response = service.login('admin@example.com', 'supersecret');

    expect(response.user.email).toBe('admin@example.com');
    expect(typeof response.token).toBe('string');
    expect(response.token.split('.')).toHaveLength(2);
  });

  it('rejects invalid credentials', () => {
    expect(() => service.login('admin@example.com', 'wrong-pass')).toThrow(UnauthorizedException);
  });

  it('verifies a valid token and returns the authenticated user', () => {
    const { token } = service.login('admin@example.com', 'supersecret');

    expect(service.verifyToken(token)).toEqual({
      email: 'admin@example.com',
    });
  });

  it('rejects a malformed token', () => {
    expect(() => service.verifyToken('invalid')).toThrow(UnauthorizedException);
  });
});

