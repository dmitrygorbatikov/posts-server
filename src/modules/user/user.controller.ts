import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.context';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@AuthContext() userId: string) {
    return await this.userService.getProfile(userId);
  }
}
