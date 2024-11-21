import { Controller, Get, Put, UseGuards, Request, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guard/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getUserData(@Request() req) {
    return this.userService.getUserData(req.user.uid);
  }

  @Put('me')
  async updateUsername(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUsername(
      req.user.uid,
      updateUserDto.username,
    );
  }
}
