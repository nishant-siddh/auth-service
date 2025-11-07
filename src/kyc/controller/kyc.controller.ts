import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService } from '../service/kyc.service';
import { Kyc } from '../entities/kyc.entity';
import { CreateKycDto } from '../dto/create-kyc.dto';
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { JwtCookieGuard } from 'src/auth/guard/jwt-cookie.guard';
import { GetKycFilterDto } from '../dto/get-all-kyc.dto';
import { UpdateKycDocumentVerificationStatusDto } from '../dto/update-document-verification-status.dto';

@ApiTags('kyc')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard)
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new KYC document' })
  @ApiResponse({ status: 201, description: 'KYC submitted successfully.', type: Kyc })
  create(@Body() createKycDto: CreateKycDto, @Request() req) {
    return this.kycService.create(createKycDto, req.user);
  }

  // @Post('bulk')
  // @ApiOperation({ summary: 'Submit multiple KYC documents at once' })
  // @ApiResponse({ status: 201, description: 'KYC documents submitted', type: [Kyc] })
  // createBulk(@Body() createKycBulkDto: CreateKycBulkDto, @Request() req) {
  //   return this.kycService.createBulk(createKycBulkDto, req.user);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all KYC records' })
  @ApiResponse({ status: 200, description: 'List of KYC records', type: [Kyc] })
  findAll(@Query() filterDto: GetKycFilterDto) {
    return this.kycService.findAll(filterDto);
  }
  
  @Get('/userDocuments')
  @ApiOperation({ summary: 'Get all KYC records for the current user' })
  @ApiResponse({ status: 200, description: 'List of KYC records', type: [Kyc] })
  findAllForUser(@Request() req) {
    console.log(req.user, 'this is req');
    return this.kycService.findAllForUser(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a KYC record by ID' })
  @ApiResponse({ status: 200, description: 'KYC record', type: Kyc })
  findOne(@Param('id') id: string) {
    return this.kycService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update KYC record status or document URL' })
  @ApiResponse({ status: 200, description: 'KYC updated successfully.', type: Kyc })
  update(@Param('id') id: string, @Body() updateKycDto: UpdateKycDto) {
    return this.kycService.update(id, updateKycDto);
  }
  
  @Patch('/updateDocumentStatus/:id')
  @ApiOperation({ summary: 'Update KYC record status or document URL' })
  @ApiResponse({ status: 200, description: 'KYC updated successfully.', type: Kyc })
  updateDocumentStatus(@Param('id') id: string, @Body() params: UpdateKycDocumentVerificationStatusDto) {
    return this.kycService.updateDocumentStatus(id, params);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a KYC record' })
  @ApiResponse({ status: 200, description: 'KYC deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.kycService.remove(id);
  }
}
