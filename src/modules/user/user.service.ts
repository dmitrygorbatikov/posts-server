import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.chema';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { Post } from '../post/post.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(body: CreateUserDto): Promise<User> {
    return await this.save(body);
  }

  async findById(id: number): Promise<User> {
    return this.userModel.findById(id);
  }
  async save(body: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(body);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }

  async getProfile(_id: string) {
    const user = await this.userModel.findById(_id, {
      password: 0,
    });
    if (!user) {
      throw new HttpException('UserNotFound', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}
