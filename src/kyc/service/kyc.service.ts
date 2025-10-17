import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kyc } from '../entities/kyc.entity';
import { CreateKycDto } from '../dto/create-kyc.dto';
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { UserService } from 'src/user/services/user.service';
import { GetKycFilterDto, SortBy, SortOrder } from '../dto/get-all-kyc.dto';
import {
  DocumentType,
  UpdateKycDocumentVerificationStatusDto,
} from '../dto/update-document-verification-status.dto';
import { Status } from 'src/common/enums';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
    private userService: UserService,
  ) {}

  async create(
    createKycDto: CreateKycDto,
    userFromToken: any,
  ): Promise<{ message: string }> {
    const user = await this.userService.findOne(userFromToken.sub);
    if (!user) throw new NotFoundException('User not found');

    // Check if user already has a KYC record
    const existingKyc = await this.kycRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (existingKyc)
      throw new BadRequestException('KYC record already exists for this user');

    const kyc = this.kycRepository.create({
      ...createKycDto,
      status: Status.PENDING,
      user,
    });
    await this.kycRepository.save(kyc);
    return { message: 'KYC submitted successfully' };
  }

  async findAll(
    filterDto: GetKycFilterDto,
  ): Promise<{ data: Kyc[]; totalRecords: number; currentPage: number }> {
    const {
      name,
      status,
      businessType,
      aadharIsVerified,
      panIsVerified,
      limit = 10,
      page = 1,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.ASC,
    } = filterDto;

    const queryBuilder = this.kycRepository.createQueryBuilder('kyc');

    queryBuilder
      .leftJoin('kyc.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.phone',
        'user.email',
        'user.role',
        'user.status',
      ]);

    if (name) {
      queryBuilder.andWhere('user.name ILIKE :name', {
        name: `%${name}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('kyc.status = :status', {
        status: status,
      });
    }

    if (businessType) {
      queryBuilder.andWhere('kyc.businessType = :businessType', {
        businessType: businessType,
      });
    }

    if (aadharIsVerified !== undefined) {
      queryBuilder.andWhere(
        `kyc.aadhar->>'documentStatus' = :aadharIsVerified`,
        {
          aadharIsVerified: aadharIsVerified.toString(),
        },
      );
    }

    if (panIsVerified !== undefined) {
      queryBuilder.andWhere(`kyc.pan->>'documentStatus' = :panIsVerified`, {
        panIsVerified: panIsVerified.toString(),
      });
    }

    queryBuilder.orderBy(`kyc.${sortBy}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.take(limit);
    queryBuilder.skip(skip);

    // Execute query and get data + total count for pagination meta
    const [kycRecords, totalCount] = await queryBuilder.getManyAndCount();

    return {
      data: kycRecords,
      totalRecords: totalCount,
      currentPage: kycRecords?.length,
    };
  }

  async findAllForUser(userFromToken: any): Promise<Kyc[]> {
    const user = await this.userService.getCurrentUser(userFromToken.sub);
    if (!user) throw new NotFoundException('User not found');

    return this.kycRepository.find({
      where: { user: { id: user.id } },
      select: [
        'id',
        'aadhar',
        'pan',
        'ifsc',
        'accountNumber',
        'accountHolderName',
        'bankName',
        'branchName',
        'gstNumber',
        'gstCertificate',
        'businessType',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOne(id: string): Promise<Kyc> {
    const kyc = await this.kycRepository.findOne({
      where: { id },
      select: [
        'id',
        'aadhar',
        'pan',
        'ifsc',
        'accountNumber',
        'accountHolderName',
        'bankName',
        'branchName',
        'gstNumber',
        'gstCertificate',
        'businessType',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!kyc) throw new NotFoundException('KYC record not found');
    return kyc;
  }

  async updateDocumentStatus(
    id: string,
    params: UpdateKycDocumentVerificationStatusDto,
  ): Promise<{ message: string }> {
    const { type, documentStatus } = params;

    const kyc = await this.findOne(id);
    if (!kyc) throw new NotFoundException('KYC record not found');

    if (!kyc[type]) {
      throw new BadRequestException('Document not found');
    }

    const validTypes = [DocumentType.AADHAR, DocumentType.PAN];
    if (!validTypes.includes(type)) {
      throw new BadRequestException('Invalid document type');
    }

    const updateResult = await this.kycRepository
      .createQueryBuilder()
      .update(Kyc)
      .set({
        [type]: () =>
          `jsonb_set(${type}, '{documentStatus}', '"${documentStatus}"')`,
      })
      .where(`${type} IS NOT NULL`)
      .execute();
    if (updateResult.affected === 0) {
      throw new NotFoundException(`No KYC records found with ${type} document`);
    }
    return {
      message: `${updateResult.affected} KYC record(s) updated successfully`,
    };
  }

  // async update(
  //   id: string,
  //   updateKycDto: UpdateKycDto,
  // ): Promise<{ message: string }> {
  //   const kyc = await this.kycRepository
  //     .createQueryBuilder('kyc')
  //     .leftJoin('kyc.user', 'user')
  //     .addSelect([
  //       'user.id',
  //       'user.name',
  //       'user.phone',
  //       'user.email',
  //       'user.role',
  //       'user.status',
  //     ])
  //     .where('kyc.id = :id', { id })
  //     .getOne();

  //   if (!kyc) {
  //     throw new NotFoundException(`KYC with ID ${id} not found`);
  //   }

  //   // Deep merge for Aadhar
  //   if (updateKycDto?.aadhar) {
  //     kyc.aadhar = this.mergeDefined(kyc.aadhar || {}, updateKycDto.aadhar);
  //   }

  //   // Deep merge for PAN
  //   if (updateKycDto?.pan) {
  //     kyc.pan = this.mergeDefined(kyc.pan || {}, updateKycDto.pan);
  //   }

  //   if (updateKycDto?.status) {
  //     if (updateKycDto.status === Status.PENDING) {
  //       throw new BadRequestException(
  //         'KYC status cannot be changed back to PENDING',
  //       );
  //     }
  //     if (
  //       updateKycDto.status === Status.VERIFIED ||
  //       updateKycDto.status === Status.REJECTED
  //     ) {
  //       if (kyc.status !== Status.PENDING) {
  //         throw new BadRequestException(
  //           'Only PENDING KYC can be approved or rejected',
  //         );
  //       } else {
  //         if (updateKycDto.status === Status.VERIFIED) {
  //           if (
  //             !kyc.aadhar ||
  //             kyc.aadhar.documentStatus !== Status.VERIFIED ||
  //             !kyc.pan ||
  //             kyc.pan.documentStatus !== Status.VERIFIED
  //           ) {
  //             throw new BadRequestException(
  //               'Both Aadhar and PAN documents must be VERIFIED to approve KYC',
  //             );
  //           }
  //         }
  //         console.log(kyc, 'kyc before status update');
  //         console.log(updateKycDto.status, 'updateKycDto.status');
  //         kyc.status = updateKycDto.status;
  //         console.log(kyc.user.id, 'kyc.user.id 1');
  //         await this.userService.update(kyc.user.id, {
  //           status: updateKycDto.status,
  //         });
  //         console.log(kyc.user.id, 'kyc.user.id 2');
  //       }
  //     }
  //   }

  //   // Assign top-level non-undefined fields
  //   const { aadhar, pan, ...otherFields } = updateKycDto;
  //   for (const key in otherFields) {
  //     if (otherFields[key] !== undefined) {
  //       kyc[key] = otherFields[key];
  //     }
  //   }

  //   await this.kycRepository.save(kyc);
  //   return { message: 'KYC document updated successfully' };
  // }

  async update(
    id: string,
    updateKycDto: UpdateKycDto,
  ): Promise<{ message: string }> {
    const kyc = await this.kycRepository
      .createQueryBuilder('kyc')
      .leftJoin('kyc.user', 'user')
      .addSelect([
        'user.id',
        'user.name',
        'user.phone',
        'user.email',
        'user.role',
        'user.status',
      ])
      .where('kyc.id = :id', { id })
      .getOne();

    if (!kyc) {
      throw new NotFoundException(`KYC with ID ${id} not found`);
    }

    let resetToPending = false;

    // Deep merge for Aadhar
    if (updateKycDto?.aadhar) {
      // Check if any field other than documentStatus is being updated
      const aadharUpdates = { ...updateKycDto.aadhar };
      delete aadharUpdates.documentStatus;
      if (Object.keys(aadharUpdates).length > 0) resetToPending = true;

      kyc.aadhar = this.mergeDefined(kyc.aadhar || {}, updateKycDto.aadhar);
    }

    // Deep merge for PAN
    if (updateKycDto?.pan) {
      // Check if any field other than documentStatus is being updated
      const panUpdates = { ...updateKycDto.pan };
      delete panUpdates.documentStatus;
      if (Object.keys(panUpdates).length > 0) resetToPending = true;

      kyc.pan = this.mergeDefined(kyc.pan || {}, updateKycDto.pan);
    }

    // Handle KYC status update
    if (updateKycDto?.status) {
      if (updateKycDto.status === Status.PENDING) {
        throw new BadRequestException(
          'KYC status cannot be changed back to PENDING',
        );
      }
      if (
        updateKycDto.status === Status.VERIFIED ||
        updateKycDto.status === Status.REJECTED
      ) {
        if (kyc.status !== Status.PENDING) {
          throw new BadRequestException(
            'Only PENDING KYC can be approved or rejected',
          );
        } else {
          if (updateKycDto.status === Status.VERIFIED) {
            if (
              !kyc.aadhar ||
              kyc.aadhar.documentStatus !== Status.VERIFIED ||
              !kyc.pan ||
              kyc.pan.documentStatus !== Status.VERIFIED
            ) {
              throw new BadRequestException(
                'Both Aadhar and PAN documents must be VERIFIED to approve KYC',
              );
            }
          }
          kyc.status = updateKycDto.status;
          await this.userService.update(kyc.user.id, {
            status: updateKycDto.status,
          });
        }
      }
    }

    // Assign top-level non-undefined fields
    const { aadhar, pan, status, ...otherFields } = updateKycDto;
    for (const key in otherFields) {
      if (otherFields[key] !== undefined) {
        kyc[key] = otherFields[key];
        resetToPending = true; // any top-level field change triggers PENDING
      }
    }

    // If any field change requires KYC/user to reset
    if (resetToPending && kyc.status !== Status.PENDING) {
      kyc.status = Status.PENDING;
      await this.userService.update(kyc.user.id, { status: Status.PENDING });
    }

    await this.kycRepository.save(kyc);
    return { message: 'KYC document updated successfully' };
  }

  private mergeDefined<T>(target: T, source: Partial<T>): T {
    const updated = { ...target };
    for (const key in source) {
      if (source[key] !== undefined) {
        updated[key] = source[key];
      }
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const kyc = await this.findOne(id);
    if (!kyc) throw new NotFoundException('KYC record not found');
    await this.kycRepository.softDelete(id);
  }
}
