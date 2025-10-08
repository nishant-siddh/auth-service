import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserService } from 'src/user/services/user.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    if(!registerDto.email && !registerDto.phone) {
      throw new BadRequestException('Either email or phone number is required');
    }
    const existingUser = await this.usersService.getUsers({email: registerDto.email, phone: registerDto.phone});
    if(existingUser?.data?.length > 0) {
      throw new BadRequestException('User with given details already exists');
    }
    const user = await this.usersService.create(registerDto);
    const tokens = this.generateTokens(user);
    return { tokens };
  }

  async validateUser(
    identifier: string,
    password: string
  ): Promise<User> {
    let user: User | null = null;
    if(!identifier?.trim()){
      throw new UnauthorizedException('Invalid credentials');
    }
    if(identifier?.includes('@')){
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
    if(!user.isVerified) throw new UnauthorizedException('User is not verified');
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
    const payload = { sub: user.id, email: user.email, role: user.role };
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
