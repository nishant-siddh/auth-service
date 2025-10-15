import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyOTPDto {
  @ApiProperty({
    description: 'Enter the OTP code sent to your email',
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  code: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  @IsString()
  email: string;
}
