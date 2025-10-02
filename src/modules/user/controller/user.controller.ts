import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserRole } from '../entities/user.entity';
import { GetUsersFilterDto } from '../dto/get-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt-auth.guard';


@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() filterDto: GetUsersFilterDto) {
    return await this.userService.getUsers(filterDto);
  }

  @Get(':user_id')
  async findOne(@Param('user_id') id: string) {
    return await this.userService.findOne(id);
  }

  @Patch(':user_id')
  update(@Param('user_id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':user_id')
  remove(@Param('user_id') id: string) {
    return this.userService.remove(id);
  }
}
