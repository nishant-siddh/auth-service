import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';

export class SendMailDto {
  // Aadhar Details as JSON Object
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  mailTemplateKey?: string;
  
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  to?: string;
  
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  name?: string;
}
