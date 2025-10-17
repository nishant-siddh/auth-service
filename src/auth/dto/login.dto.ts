import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Source } from 'src/common/enums';

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

  @ApiProperty({ description: 'The source of the login request', enum: Source, example: Source.USER_PANEL })
  @IsEnum(Source)
  queryType: Source;
}
