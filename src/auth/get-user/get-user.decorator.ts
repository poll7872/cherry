import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<
        import('express').Request & { user?: Record<string, unknown> }
      >();
    const user = request.user;

    if (!user) return null;

    // Si pides un campo específico → @GetUser('id')
    return data && user ? user[data] : user;
  },
);
