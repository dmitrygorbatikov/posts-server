import { Controller } from '@nestjs/common';
import { PostService } from './post.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async getPosts() {
    await this.postService.uploadNewPosts();
  }
}
