import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
} from 'class-validator';
import { Status } from 'src/common/enums';

export enum DocumentType {
  AADHAR = 'aadhar',
  PAN = 'pan',
}

export class UpdateKycDocumentVerificationStatusDto {
  @ApiProperty({
    example: 'aadhar',
    default: DocumentType.AADHAR,
    enum: DocumentType,
  })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({
    description: 'Aadhar verification status',
    example: Status.PENDING,
    default: Status.PENDING,
    enum: Status,
  })
  @IsEnum(Status)
  documentStatus: Status;
}
