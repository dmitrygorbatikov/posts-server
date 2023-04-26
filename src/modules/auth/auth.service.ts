import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { SignInUserDto } from './dto/signin-user.dto';
import { loginSchema } from '../../validation/auth';
import { UserService } from '../user/user.service';
import { UserRoleEnum } from '../user/user.types';
import { SignUpUserDto } from './dto/signup-user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  async signInUser(body: SignInUserDto) {
    const { email, password } = body;
    const { error } = loginSchema.validate({ email, password });

    if (error) {
      throw new HttpException(error, HttpStatus.NOT_FOUND);
    }
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new HttpException('UserNotFound', HttpStatus.NOT_FOUND);
    }

    if (user.role === UserRoleEnum.user) {
      throw new HttpException('NotEnoughRights', HttpStatus.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException('IncorrectPassword', HttpStatus.BAD_REQUEST);
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
    );

    return { accessToken, user };
  }

  async signUpUser(body: SignUpUserDto) {
    const { email, password, name } = body;

    const candidate = await this.userService.findByEmail(email);

    if (candidate) {
      throw new HttpException('UserAlreadyExist', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userService.createUser({
      name,
      email,
      password: hashedPassword,
      role: UserRoleEnum.user,
    });
    const accessToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
    );

    return { accessToken, user };
  }
}
