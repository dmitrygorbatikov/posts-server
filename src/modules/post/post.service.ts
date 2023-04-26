import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import * as xml2js from 'xml2js';
import axios from 'axios';
import * as process from 'process';
import { SortEnum, SortNamesEnum } from './post.types';
import { GetPostsDto } from './dto/get-posts.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  async findOneByLink(link: string): Promise<Post> {
    return this.postModel.findOne({ link }).exec();
  }

  async findOneById(_id: string): Promise<Post> {
    return this.postModel.findById(_id).exec();
  }

  async updateOne(_id: string, body) {
    await this.postModel.updateOne({ _id }, body);
    return this.findOneById(_id);
  }

  async deleteOne(_id: string): Promise<any> {
    return this.postModel.deleteOne({ _id });
  }

  async deleteMany(ids: string[]): Promise<any> {
    const result = await this.postModel
      .deleteMany({ _id: { $in: ids } })
      .exec();
    return { deletedCount: result.deletedCount };
  }

  async find(query: GetPostsDto) {
    const {
      page = '1',
      perPage = '10',
      sortBy = SortNamesEnum._id,
      sort = SortEnum.ASC,
      search = '',
      dateFrom = new Date(0),
      dateTo = new Date(),
    } = query;

    const created_at = { $gte: dateFrom, $lte: dateTo };

    if (dateFrom < dateTo) {
      created_at.$gte = dateFrom;
      created_at.$lte = dateTo;
    } else {
      created_at.$gte = new Date(0);
      created_at.$lte = new Date();
    }
    const sortDir = sort === SortEnum.DESC ? -1 : 1;

    const posts = await this.postModel.aggregate([
      {
        $match: {
          created_at,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { link: { $regex: search, $options: 'i' } },
          ],
        },
      },
      { $sort: { [sortBy]: sortDir } },
      { $skip: Number(page) * Number(perPage) },
      { $limit: Number(perPage) },
    ]);

    const count = await this.postModel.find().count();

    return {
      posts,
      count,
    };
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
        const exists = await this.findOneByLink(post.link);
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
