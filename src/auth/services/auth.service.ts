import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserService } from 'src/user/services/user.service';
import { User, UserRole } from 'src/user/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OTPVerification } from '../entities/otpverification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { VerifyOTPDto } from '../dto/verifyOTP.dto';
import { generateOTP } from '../util/generateOtp';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  private readonly emailServiceUrl =
    process.env.NOTIFICATION_SERVICE + '/email-notification' || '';
  constructor(
    @InjectRepository(OTPVerification)
    private otpRepository: Repository<OTPVerification>,

    private usersService: UserService,
    private jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async sendWelcomeMail(user: User) {
    if (!user.email) {
      throw new BadRequestException('User does not have an email');
    }

    const templateKey =
      '2518b.703a4863d9572e4b.k1.aa132950-a3a1-11f0-97bb-cabf48e1bf81.199bfaea865';
    const emailEndpoint = this.emailServiceUrl;

    const payload = {
      mailTemplateKey: templateKey,
      to: user.email,
      mergeInfo: { name: user.name },
    };

    const { data } = await firstValueFrom(
      this.httpService.post(emailEndpoint, payload),
    );
    return data;
  }

  async sendOTP(user: User) {
    const templateKey =
      '2518b.703a4863d9572e4b.k1.42990300-a9ee-11f0-9123-ae9c7e0b6a9f.199e8f6f730';
    const emailEndpoint = this.emailServiceUrl;
    const generatedOTP = generateOTP();

    const payload = {
      mailTemplateKey: templateKey,
      to: user.email,
      mergeInfo: { name: user.name, OTP: generatedOTP },
    };

    const otp = this.otpRepository.create({
      email: user.email,
      otp: payload.mergeInfo.OTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    await this.otpRepository.save(otp);

    const { data } = await firstValueFrom(
      this.httpService.post(emailEndpoint, payload),
    );
    return data;
  }

  async register(registerDto: RegisterDto) {
    if (!registerDto.email && !registerDto.phone) {
      throw new BadRequestException('Either email or phone number is required');
    }
    const existingUser = await this.usersService.getUsers({
      email: registerDto.email,
      phone: registerDto.phone,
    });
    if (existingUser?.data?.length > 0) {
      throw new BadRequestException('User with given details already exists');
    }
    const user = await this.usersService.create(registerDto);

    this.sendOTP(user);

    return;
  }

  async verifyEmail(verifyOTPDto: VerifyOTPDto) {
    const { code, email } = verifyOTPDto;
    try {
      const otp = await this.otpRepository.findOneByOrFail({
        email: email,
        otp: code,
      });
      if (!otp) {
        throw new UnauthorizedException('Invalid OTP');
      }
      if (otp.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid OTP');
      }
      await this.otpRepository.delete({ id: otp.id });

      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      await this.usersService.update(user.id, { isEmailVerified: true });

      this.sendWelcomeMail(user);

      const tokens = this.generateTokens(user);
      return { message: 'Email verified successfully', tokens };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async validateUser(identifier: string, password: string): Promise<User> {
    let user: User | null = null;
    if (!identifier?.trim()) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (identifier?.includes('@')) {
      identifier = identifier.toLowerCase();
      user = await this.usersService.findByEmail(identifier);
    } else {
      user = await this.usersService.findByPhone(identifier);
    }
    if (!user) throw new UnauthorizedException('Invalid credentials');
    console.log(user.password, password, 'bcrypt compare');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    // for now only verified users can login but this will be changed later
    if (!user.isVerified)
      throw new UnauthorizedException('User is not verified');
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(
      loginDto.identifier,
      loginDto.password,
    );
    const tokens = this.generateTokens(user);
    return { tokens };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.usersService.findOne(payload.sub);
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    };
  }
}
