import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

interface AuthTokenPayload {
  email: string;
  exp: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  login(email: string, password: string) {
    const expectedEmail = this.configService.getOrThrow<string>('AUTH_EMAIL');
    const expectedPassword = this.configService.getOrThrow<string>('AUTH_PASSWORD');

    if (email !== expectedEmail || password !== expectedPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return {
      token: this.signToken({ email }),
      user: {
        email,
      },
    };
  }

  verifyToken(token: string) {
    try {
      const [payloadPart, signaturePart] = token.split('.');

      if (!payloadPart || !signaturePart) {
        throw new UnauthorizedException('Invalid token.');
      }

      const expectedSignature = this.createSignature(payloadPart);
      const receivedBuffer = Buffer.from(signaturePart);
      const expectedBuffer = Buffer.from(expectedSignature);

      if (receivedBuffer.length !== expectedBuffer.length) {
        throw new UnauthorizedException('Invalid token.');
      }

      const validSignature = timingSafeEqual(receivedBuffer, expectedBuffer);

      if (!validSignature) {
        throw new UnauthorizedException('Invalid token.');
      }

      const payload = JSON.parse(
        Buffer.from(payloadPart, 'base64url').toString('utf8'),
      ) as AuthTokenPayload;

      if (payload.exp < Date.now()) {
        throw new UnauthorizedException('Token expired.');
      }

      return {
        email: payload.email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid token.');
    }
  }

  private signToken({ email }: { email: string }) {
    const expiresInMs = Number(this.configService.get<string>('AUTH_TOKEN_TTL_MS') ?? 86_400_000);
    const payload = Buffer.from(
      JSON.stringify({
        email,
        exp: Date.now() + expiresInMs,
      } satisfies AuthTokenPayload),
      'utf8',
    ).toString('base64url');

    return `${payload}.${this.createSignature(payload)}`;
  }

  private createSignature(payload: string) {
    return createHmac('sha256', this.configService.getOrThrow<string>('AUTH_TOKEN_SECRET'))
      .update(payload)
      .digest('base64url');
  }
}
