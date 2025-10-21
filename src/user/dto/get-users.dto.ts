import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Status } from 'src/common/enums';

export enum SortBy {
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetUsersFilterDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'john doe',
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
  @IsEmail()
  @IsOptional()
  email?: string;
  
  @ApiProperty({
    description: 'The phone of the user',
    example: '+919656576787',
    required: false,
  })
  @IsOptional()
  phone?: string;
  
  @ApiProperty({
    description: 'Filter by verification status',
    example: Status.PENDING,
    enum: Status,
    required: false,
  })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
  
  @ApiProperty({
    description: 'Filter by email verification status',
    example: true,
    required: false,
  })
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty({
    description: 'The role of the user',
    example: UserRole.INDIVIDUAL,
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'role must be either individual or agency' })
  role?: UserRole;

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
  limit?: number = 1;

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
