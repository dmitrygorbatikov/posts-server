import { Body, Controller, Post } from '@nestjs/common';
import { SignInUserDto } from './dto/signin-user.dto';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup-user.dto';

@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}
  @Post('/sign-in')
  async signInUser(@Body() body: SignInUserDto) {
    return await this.authService.signInUser(body);
  }

  @Post('/sign-up')
  async signUpUser(@Body() body: SignUpUserDto) {
    return await this.authService.signUpUser(body);
  }
}
