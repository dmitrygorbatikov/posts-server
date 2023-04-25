import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import * as xml2js from 'xml2js';
import axios from 'axios';
import * as process from 'process';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  async findOne(link: string): Promise<Post> {
    return this.postModel.findOne({ link }).exec();
  }

  async save(createPostDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async uploadNewPosts() {
    try {
      const xml = await axios.get(process.env.UPLOAD_URL);
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(xml.data);
      const posts = result.rss.channel[0].item.map((item: any) => {
        const post: any = {};
        post.title = item.title[0];
        post.link = item.link[0];
        post.description = item.description[0];
        post.pubDate = new Date(item.pubDate[0]);
        return post;
      });
      for (const post of posts) {
        const exists = await this.findOne(post.link);
        if (!exists) {
          await this.save(post);
        }
      }
      return posts;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
