import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { UserRole } from 'src/modules/user/entities/user.entity';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: '123456' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'The role of the user', example: 'user' })
  @IsString()
  @IsEnum(UserRole, { message: 'role must be either user or admin' })
  role: UserRole;
}
