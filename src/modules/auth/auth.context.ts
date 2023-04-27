import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user.userId;
  },
);
