import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { GetUsersFilterDto, SortBy, SortOrder } from '../dto/get-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    if (registerDto.role === UserRole.AGENCY) {
      if (!registerDto.companyName?.trim()) {
        throw new BadRequestException(
          'Company name is required for agency registration',
        );
      }
    } else {
      registerDto.companyName = undefined;
    }

    if (registerDto.name) registerDto.name = registerDto.name.trim();
    if (registerDto.email) registerDto.email = registerDto.email.toLowerCase();
    if (registerDto.phone) registerDto.phone = registerDto.phone.trim();
    if (registerDto.companyName)
      registerDto.companyName = registerDto.companyName.trim();

    const { password } = registerDto;
    const hashedPassword = await bcrypt.hash(password?.trim(), 10);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async getUsers(
    filterDto: GetUsersFilterDto,
  ): Promise<{ data: User[]; totalRecords: number; currentPage: number }> {
    const {
      name,
      email,
      phone,
      role,
      status,
      isEmailVerified,
      limit = 10,
      page = 1,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.ASC,
    } = filterDto;
    
    const query = this.usersRepository.createQueryBuilder('user');

    query.select([
      'user.id',
      'user.name',
      'user.phone',
      'user.email',
      'user.companyName',
      'user.status',
      'user.isEmailVerified',
      'user.role',
      'user.createdAt',
      'user.updatedAt',
    ]);

    // Filters
    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (email && phone) {
      query.andWhere('(user.email = :email OR user.phone = :phone)', {
        email,
        phone,
      });
    } else if (email) {
      query.andWhere('user.email = :email', { email });
    } else if (phone) {
      query.andWhere('user.phone = :phone', { phone });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (isEmailVerified) {
      query.andWhere('user.isEmailVerified = :isEmailVerified', {
        isEmailVerified,
      });
    }

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    // Soft delete: exclude soft deleted users if using soft delete
    query.andWhere('user.deleted_at IS NULL');

    // Sorting
    query.orderBy(`user.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    query.take(limit);
    query.skip(skip);

    // Execute query and get data + total count for pagination meta
    const [users, totalCount] = await query.getManyAndCount();

    console.log(users, 'users');

    return {
      data: users,
      totalRecords: totalCount,
      currentPage: users?.length,
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'phone',
        'email',
        'role',
        'companyName',
        'createdAt',
        'updatedAt',
        'status',
        'isEmailVerified',
      ],
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { phone },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update the user's fields
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // // Soft delete by setting `deletedAt` field (Assuming the user entity has a deletedAt field)
    // user.deleted_at = new Date(); // Or user.status = 'deleted' if you prefer status field.

    await this.usersRepository.softDelete(id);

    return this.usersRepository.save(user);
  }

  async getCurrentUser(userFromToken: any): Promise<User> {
    const user = await this.findOne(userFromToken.sub);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
