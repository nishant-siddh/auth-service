import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
  
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
  
  @ApiProperty({
    description: 'Change verified status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
  
  @ApiProperty({
    description: 'Change email verified status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}
