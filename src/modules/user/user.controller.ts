import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.context';
import { UserService } from './user.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeProfileDto } from './dto/change-profile.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@AuthContext() userId: string) {
    return await this.userService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/change-password')
  async changePassword(
    @AuthContext() userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/profile')
  async changeProfile(
    @AuthContext() userId: string,
    @Body() body: ChangeProfileDto,
  ) {
    return await this.userService.changeProfile(userId, body);
  }
}
