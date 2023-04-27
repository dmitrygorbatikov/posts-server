import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import * as xml2js from 'xml2js';
import axios from 'axios';
import * as process from 'process';
import { SortEnum, SortNamesEnum } from './post.types';
import { GetPostsDto } from './dto/get-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ErrorTypes } from '../../types/error.types';

@Injectable()
export class PostService {
  constructor(@InjectModel('Post') private readonly postModel: Model<Post>) {}

  async findOneByLink(link: string): Promise<Post> {
    return this.postModel.findOne({ link }).exec();
  }

  async findOneById(_id: string): Promise<Post> {
    const user = await this.postModel.findById(_id).exec();
    if (!user) {
      throw new HttpException(
        { user: ErrorTypes.UserNotFound },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.postModel.findById(_id).exec();
  }

  async updateOne(_id: string, body: UpdatePostDto) {
    const post = await this.postModel.findOne({
      link: body.link,
      _id: { $ne: _id },
    });
    if (post) {
      throw new HttpException(
        { link: ErrorTypes.LinkAlreadyExist },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.postModel.updateOne({ _id }, body);
    return this.findOneById(_id);
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

    const $match = {
      created_at,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { link: { $regex: search, $options: 'i' } },
      ],
    };

    const posts = await this.postModel.aggregate([
      {
        $match,
      },
      { $sort: { [sortBy]: sortDir } },
      { $skip: Number(page) * Number(perPage) },
      { $limit: Number(perPage) },
    ]);

    const count = await this.postModel
      .aggregate([
        {
          $match,
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ])
      .exec();
    const numberOfPosts = count[0]?.count ?? 0;
    return {
      posts,
      count: numberOfPosts,
    };
  }

  async save(createPostDto: CreatePostDto): Promise<Post> {
    const post = await this.findOneByLink(createPostDto.link);
    if (post) {
      throw new HttpException(
        { link: ErrorTypes.LinkAlreadyExist },
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdPost = new this.postModel(createPostDto);
    return createdPost.save();
  }

  async uploadNewPosts() {
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
  }
}
