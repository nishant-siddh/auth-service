import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType } from '../entities/kyc.entity';
import { Aadhar } from '../entities/aadhar.entity';
import { Pan } from '../entities/pan.entity';
import { Status } from 'src/common/enums';

export class UpdateKycDto {
  // Aadhar Details as JSON Object
  @ApiPropertyOptional({ type: Aadhar })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Aadhar)
  aadhar?: Aadhar;

  // PAN Details as JSON Object
  @ApiPropertyOptional({ type: Pan })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Pan)
  pan?: Pan;

  // Bank Details
  @ApiPropertyOptional({ example: 'SBIN0001234' })
  @IsOptional()
  @IsString()
  ifsc?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @ApiPropertyOptional({ example: 'State Bank of India' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: 'Main Branch' })
  @IsOptional()
  @IsString()
  branchName?: string;

  // GST Details
  @ApiPropertyOptional({ example: '22ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/gst-certificate.pdf' })
  @IsOptional()
  @IsString()
  gstCertificate?: string;

  // Business Type
  @ApiPropertyOptional({ enum: BusinessType, example: BusinessType.INDIVIDUAL })
  @IsOptional()
  @IsEnum(BusinessType)
  businessType?: BusinessType;

  // Overall KYC Status
  @ApiPropertyOptional({ enum: Status })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
