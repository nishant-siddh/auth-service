import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { KycStatus } from '../entities/kyc.entity';

export class UpdateKycDto {
  @ApiPropertyOptional({ enum: KycStatus })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;

  @ApiPropertyOptional({ example: 'https://example.com/docs/new.pdf' })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}
