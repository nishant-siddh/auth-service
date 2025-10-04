import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();

    const accessToken = request.cookies['accessToken'];
    const refreshToken = request.cookies['refreshToken'];

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No tokens provided');
    }

    try {
      // Verify access token by decoding it manually to get user id
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload;
      return true;
    } catch (accessTokenError) {
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token missing');
      }

      // Try refreshing tokens using your AuthService helper
      try {
        const tokens = await this.authService.refreshTokens(refreshToken);

        // Set new tokens as cookies
        response.cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 15 * 60 * 1000, // 15 mins or your env config
        });
        response.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days or your env config
        });

        // Decode access token to attach user info to request
        const payload = await this.jwtService.verifyAsync(tokens.accessToken, {
          secret: process.env.JWT_SECRET,
        });
        request.user = payload;
        return true;
      } catch (refreshError) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
    }
  }
}