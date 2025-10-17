import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from 'src/common/enums';

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
    example: Status.PENDING,
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
  
  @ApiProperty({
    description: 'Change email verified status',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}
