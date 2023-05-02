import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import * as process from 'process';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  validateToken(token: string): any {
    try {
      return jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    } catch (err) {
      throw new HttpException({ user: 'InvalidToken' }, HttpStatus.BAD_REQUEST);
    }
  }

  canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const token = request.headers.authorization;

    if (!token) {
      return false;
    }

    request.user = this.validateToken(token);

    return true;
  }
}
