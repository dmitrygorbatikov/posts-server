import { SortEnum, SortNamesEnum } from '../post.types';

export class GetPostsDto {
  page?: string;
  perPage?: string;
  sort?: SortEnum;
  sortBy?: SortNamesEnum;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
