import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import type { AuthenticatedUser, GraphqlRequestContext } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    context: ExecutionContext,
  ): AuthenticatedUser | undefined => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphqlRequestContext>();

    return gqlContext.req.user;
  },
);
