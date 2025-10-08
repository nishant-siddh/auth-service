import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kyc, KycStatus } from '../entities/kyc.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateKycDto } from '../dto/create-kyc.dto';
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { CreateKycBulkDto } from '../dto/bulk-upload-kyc.dto';
import { UserService } from 'src/user/services/user.service';
import { GetKycFilterDto, SortBy, SortOrder } from '../dto/get-all-kyc.dto';

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

    const existingKyc = await this.kycRepository.findOne({
      where: { user: { id: user.id }, documentType: createKycDto.documentType },
    });
    if (existingKyc)
      throw new BadRequestException('KYC document already exists');

    const kyc = this.kycRepository.create({
      ...createKycDto,
      status: KycStatus.PENDING,
      user,
    });
    await this.kycRepository.save(kyc);
    return { message: 'KYC submitted successfully' };
  }

  async createBulk(
    dto: CreateKycBulkDto,
    userFromToken: any,
  ): Promise<{ message: string }> {
    const user = await this.userService.findOne(userFromToken.sub);
    if (!user) throw new NotFoundException('User not found');

    let submittedCount = 0;

    for (const doc of dto.documents) {
      try {
        // Reuse the existing create() method
        await this.create(doc, userFromToken);
        submittedCount++;
      } catch (err) {
        // If document already exists, skip it
        if (!(err instanceof BadRequestException)) {
          throw err; // rethrow unexpected errors
        }
      }
    }

    return {
      message:
        submittedCount > 0
          ? `${submittedCount} KYC document(s) submitted successfully`
          : 'All documents already exist, nothing to submit',
    };
  }

  async findAll(
    filterDto: GetKycFilterDto,
  ): Promise<{ data: Kyc[]; totalRecords: number; currentPage: number }> {
    const {
      name,
      documentType,
      status,
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
        'user.isVerified',
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

    if (documentType) {
      queryBuilder.andWhere('kyc.documentType ILIKE :documentType', {
        documentType: `%${documentType}%`,
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
    const user = await this.userService.findOne(userFromToken.sub);
    if (!user) throw new NotFoundException('User not found');

    return this.kycRepository.find({
      where: { user: { id: user.id } },
      select: [
        'id',
        'documentType',
        'documentUrl',
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
        'documentType',
        'documentUrl',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!kyc) throw new NotFoundException('KYC record not found');
    return kyc;
  }

  async update(
    id: string,
    updateKycDto: UpdateKycDto,
  ): Promise<{ message: string }> {
    const kyc = await this.findOne(id);
    Object.assign(kyc, updateKycDto);
    await this.kycRepository.save(kyc);
    return { message: 'KYC document updated successfully' };
  }

  async remove(id: string): Promise<void> {
    const kyc = await this.findOne(id);
    if (!kyc) throw new NotFoundException('KYC record not found');
    await this.kycRepository.softDelete(id);
  }
}
