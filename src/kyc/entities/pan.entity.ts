import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Length, Matches } from 'class-validator';

export class Pan {
  @ApiPropertyOptional({
    description: 'PAN number (10 characters: 5 letters + 4 digits + 1 letter)',
    example: 'ABCDE1234F',
    minLength: 10,
    maxLength: 10,
  })
  @IsOptional()
  @IsString({ message: 'PAN number must be a string' })
  @Length(10, 10, { message: 'PAN number must be exactly 10 characters' })
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'PAN number must be in format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)',
  })
  panNumber?: string;

  @ApiPropertyOptional({
    description: 'URL to PAN front image',
    example: 'https://example.com/pan-front.jpg',
  })
  @IsOptional()
  @IsString({ message: 'PAN front image URL must be a string' })
  @Matches(/^https?:\/\/.+/, { message: 'PAN front image URL must be a valid URL' })
  panFront?: string;

  @ApiPropertyOptional({
    description: 'URL to PAN back image (optional)',
    example: 'https://example.com/pan-back.jpg',
  })
  @IsOptional()
  @IsString({ message: 'PAN back image URL must be a string' })
  @Matches(/^https?:\/\/.+/, { message: 'PAN back image URL must be a valid URL' })
  panBack?: string;

  @ApiPropertyOptional({
    description: 'PAN verification status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'PAN verification status must be a boolean' })
  isVerified?: boolean;

  constructor(partial: Partial<Pan> = {}) {
    Object.assign(this, {
      isVerified: false,
      ...partial,
    });
  }
}
