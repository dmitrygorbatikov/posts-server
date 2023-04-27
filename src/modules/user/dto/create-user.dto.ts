import { UserRoleEnum } from '../user.types';

export class CreateUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly role: UserRoleEnum;
}
