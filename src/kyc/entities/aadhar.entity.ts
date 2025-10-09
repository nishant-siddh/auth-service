import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Length, Matches } from 'class-validator';

export class Aadhar {
  @ApiPropertyOptional({
    description: 'Aadhar number (12 digits)',
    example: '123456789012',
    minLength: 12,
    maxLength: 12,
  })
  @IsOptional()
  @IsString({ message: 'Aadhar number must be a string' })
  @Length(12, 12, { message: 'Aadhar number must be exactly 12 digits' })
  @Matches(/^\d{12}$/, { message: 'Aadhar number must contain only digits' })
  aadharNumber?: string;

  @ApiPropertyOptional({
    description: 'URL to Aadhar front image',
    example: 'https://example.com/aadhar-front.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Aadhar front image URL must be a string' })
  @Matches(/^https?:\/\/.+/, { message: 'Aadhar front image URL must be a valid URL' })
  aadharFront?: string;

  @ApiPropertyOptional({
    description: 'URL to Aadhar back image',
    example: 'https://example.com/aadhar-back.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Aadhar back image URL must be a string' })
  @Matches(/^https?:\/\/.+/, { message: 'Aadhar back image URL must be a valid URL' })
  aadharBack?: string;

  @ApiPropertyOptional({
    description: 'Aadhar verification status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Aadhar verification status must be a boolean' })
  isVerified?: boolean;

  constructor(partial: Partial<Aadhar> = {}) {
    Object.assign(this, {
      isVerified: false,
      ...partial,
    });
  }
}
