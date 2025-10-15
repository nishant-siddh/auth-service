import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RolesGuard } from '../guard/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtCookieGuard } from '../guard/jwt-cookie.guard';
import { VerifyOTPDto } from '../dto/verifyOTP.dto';
import { UserService } from 'src/user/services/user.service';
import { ResendOTPDto } from '../dto/resendOtp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    await this.authService.register(registerDto);

    return res.json({
      message: 'Registered and otp sent on email successfully',
    });
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { tokens } = await this.authService.login(loginDto);
    console.log(tokens);

    // set cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({ message: 'Login successful', status: 'success' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    // Verify the refresh token
    const newTokens = await this.authService.refreshTokens(refreshToken);
    if (!newTokens) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Set new tokens as cookies
    res.cookie('accessToken', newTokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15 minutes
    });

    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.json({ message: 'Tokens refreshed successfully' });
  }

  @Post('verify-email')
  async verifyEmail(@Body() verifyOTPDto: VerifyOTPDto, @Res() res: Response) {
    try {
      const { tokens } = await this.authService.verifyEmail(verifyOTPDto);

      // set cookies
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true on production
        sameSite: 'strict',
        maxAge: 1000 * 60 * 15, // 15 minutes
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      return res.json({ message: 'Email verified successfully' });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Post('resend-otp')
  async resendOTP(@Body() resendOTPDto: ResendOTPDto, @Res() res: Response) {
    const user = await this.userService.findByEmail(resendOTPDto.email);

    console.log(user, 'user');

    if(!user) {
      throw new UnauthorizedException(`User with email ${resendOTPDto.email} not found`);
    }

    const otp = await this.authService.sendOTP(user);
    
    console.log(otp, 'otp');

    return res.json({ message: 'OTP resent successfully' });
  }

  @ApiBearerAuth()
  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles('admin')
  @Post('admin-only')
  adminOnlyEndpoint(@Req() req: any) {
    return { message: 'Hello Admin' };
  }
}
