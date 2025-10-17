import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BusinessType } from '../entities/kyc.entity';
import { Status } from 'src/common/enums';

export enum SortBy {
  CREATED_AT = 'createdAt',
  STATUS = 'status',
  BUSINESS_TYPE = 'businessType',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetKycFilterDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
  
  @ApiProperty({
    description: 'The status of the KYC document',
    example: 'pending',
    enum: Status,
    required: false,
  })
  @IsString()
  @IsEnum(Status, { message: 'status must be either pending, verified, or rejected' })
  @IsOptional()
  status?: Status;
  
  @ApiProperty({
    description: 'The business type',
    example: 'individual',
    enum: BusinessType,
    required: false,
  })
  @IsString()
  @IsEnum(BusinessType)
  @IsOptional()
  businessType?: BusinessType;

  @ApiProperty({
    description: 'Filter by Aadhar verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  aadharIsVerified?: boolean;

  @ApiProperty({
    description: 'Filter by PAN verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  panIsVerified?: boolean;

  @ApiProperty({
    description: 'The number of items per page (optional, default: 10)',
    required: false,
    type: Number,
    default: 10,
    example: 10,
  })
  @IsOptional()
  // @IsInt()
  // @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'The page number for pagination (optional, default: 1)',
    required: false,
    type: Number,
    default: 1,
    example: 1,
  })
  @IsOptional()
  // @IsInt()
  // @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'The field to sort by',
    required: false,
    enum: SortBy,
    default: SortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiProperty({
    description: 'The sort order',
    required: false,
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
