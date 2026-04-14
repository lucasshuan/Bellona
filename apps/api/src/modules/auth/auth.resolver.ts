import { Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { User } from './user.model';
import { GqlAuthGuard } from './gql-auth.guard';
import { DatabaseProvider } from '../../database/database.provider';

@Resolver(() => User)
export class AuthResolver {
  constructor(private databaseProvider: DatabaseProvider) {}

  @Query(() => User, { name: 'me', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getMe(@Context() context: { req: { user: { id: string } } }) {
    const userId = context.req.user.id;
    return this.databaseProvider.user.findFirst({
      where: {
        id: userId,
      },
    });
  }
}
