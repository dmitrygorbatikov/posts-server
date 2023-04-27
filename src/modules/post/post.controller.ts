import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}
  @Cron(CronExpression.EVERY_HOUR)
  async uploadPosts() {
    await this.postService.uploadNewPosts();
  }

  @Get()
  async getPosts(@Query() query: GetPostsDto) {
    return await this.postService.find(query);
  }

  @Post()
  async createPost(@Body() body: CreatePostDto) {
    return await this.postService.save(body);
  }
  @Put(':id')
  async updatePost(@Param() param, @Body() body: UpdatePostDto) {
    return await this.postService.updateOne(param.id, body);
  }

  @Delete('/list')
  async deletePostList(@Query() query): Promise<any> {
    return await this.postService.deleteMany(query.ids.split(','));
  }
}
