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
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from '../services/user.service';
import { GetUsersFilterDto } from '../dto/get-users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtCookieGuard } from 'src/modules/auth/guard/jwt-cookie.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtCookieGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() filterDto: GetUsersFilterDto) {
    return await this.userService.getUsers(filterDto);
  }

  @Get('/get-current-user')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieves the full profile information of the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid' },
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        phone: { type: 'string', example: '+1234567890' },
        role: { type: 'string', enum: ['individual', 'agency'] },
        companyName: { type: 'string', nullable: true },
        isVerified: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or expired token' 
  })
  async getCurrentUser(@Request() req) {
    return await this.userService.getCurrentUser(req.user);
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

  @Post('logout')
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Clears authentication cookies and logs out the user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged out successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout successful' },
        status: { type: 'string', example: 'success' }
      }
    }
  })
  async logout(@Res() res: Response) {
    // Clear the authentication cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.json({ 
      message: 'Logout successful', 
      status: 'success' 
    });
  }
}
