import {
  Controller,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
  Request,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guard/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@Controller('users')
@UseGuards(AuthGuard)
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getUserData(@Request() req) {
    return {
      message: 'User data retrieved successfully',
      data: await this.userService.getUserData(req.user.uid),
    };
  }

  @Put('me')
  async updateUsername(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return {
      message: 'Username updated successfully',
      data: await this.userService.updateUsername(
        req.user.uid,
        updateUserDto.username,
      ),
    };
  }
}
