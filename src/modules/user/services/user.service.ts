import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { GetUsersFilterDto, SortBy, SortOrder } from '../dto/get-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const { password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async getUsers(filterDto: GetUsersFilterDto) {
    const {
      name,
      email,
      role,
      limit = 10,
      page = 1,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.ASC,
    } = filterDto;

    const query = this.usersRepository.createQueryBuilder('user');

    // Filters
    if (name) {
      query.andWhere('user.name ILIKE :name', { name: `%${name}%` });
    }

    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
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

    return {
      data: users,
      totalRecords: totalCount,
      currentPage: users?.length,
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'phone', 'email', 'role'],
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
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
}
