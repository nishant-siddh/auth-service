import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Enter email or phoneNumber',
    example: 'johndoe@gmail.com or 9878787676',
  })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'The password of the user', example: '123456' })
  @IsString()
  password: string;
}
