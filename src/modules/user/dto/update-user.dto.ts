import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

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
}
