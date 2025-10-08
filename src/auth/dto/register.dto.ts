import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/user/entities/user.entity';

export class RegisterDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'john doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The phone of the user',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @MinLength(10)
  phone?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @ApiProperty({
    description: 'Name of the company in case of user is registering as an agency',
    example: 'Shipseva',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'The password of the user', example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The role of the user', enum: UserRole, example: UserRole.INDIVIDUAL })
  @IsString()
  @IsEnum(UserRole, { message: 'role must be either individual or agency' })
  role: UserRole;
}
