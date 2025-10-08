import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKycDto {
  @ApiProperty({ example: 'Aadhaar' })
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @ApiProperty({ example: 'https://example.com/docs/aadhaar.pdf' })
  @IsNotEmpty()
  @IsString()
  documentUrl: string;
}