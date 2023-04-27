import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.chema';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ErrorTypes } from '../../types/error.types';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(body: CreateUserDto): Promise<User> {
    return await this.save(body);
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }
  async save(body: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(body);
    return createdUser.save();
  }

  async updateOne(_id: string, body) {
    await this.userModel.updateOne({ _id }, body);
    return this.findById(_id);
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async getProfile(_id: string) {
    const user = await this.userModel.findById(_id, {
      password: 0,
    });
    if (!user) {
      throw new HttpException(
        { user: ErrorTypes.UserNotFound },
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async changePassword(_id: string, body: ChangePasswordDto) {
    const user = await this.userModel.findById(_id);
    if (!user) {
      throw new HttpException(
        { user: ErrorTypes.UserNotFound },
        HttpStatus.NOT_FOUND,
      );
    }

    const { oldPassword, newPassword } = body;

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new HttpException(
        { oldPassword: ErrorTypes.IncorrectOldPassword },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    return this.updateOne(user._id, { password: hashedPassword });
  }

  async changeProfile(_id: string, body: ChangeProfileDto) {
    const user = await this.userModel.findById(_id);
    if (!user) {
      throw new HttpException(
        { user: ErrorTypes.UserNotFound },
        HttpStatus.NOT_FOUND,
      );
    }
    const { name, email } = body;

    const checkUserEmail = await this.userModel.findOne({
      email,
      _id: { $ne: user._id },
    });

    if (checkUserEmail) {
      throw new HttpException(
        { email: ErrorTypes.UserAlreadyExist },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.updateOne(user._id, { name, email });
  }
}
