import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class DocumentDto {
  @ApiProperty({ example: 'Aadhaar' })
  @IsNotEmpty()
  @IsString()
  documentType: string;

  @ApiProperty({ example: 'https://example.com/docs/aadhaar.pdf' })
  @IsNotEmpty()
  @IsString()
  documentUrl: string;
}

export class CreateKycBulkDto {
  @ApiProperty({ type: [DocumentDto] })
  @IsNotEmpty()
  documents: DocumentDto[];
}
