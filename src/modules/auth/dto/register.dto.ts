import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/modules/user/entities/user.entity';

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
  })
  @MinLength(10)
  phone: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: '123456' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'The role of the user', example: 'user' })
  @IsString()
  @IsEnum(UserRole, { message: 'role must be either user or admin' })
  role: UserRole;
}
