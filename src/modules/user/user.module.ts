import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserChema } from './user.chema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserChema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
