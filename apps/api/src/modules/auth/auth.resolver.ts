import { Query, Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { User } from './user.model';
import { GqlAuthGuard } from './gql-auth.guard';
import { DatabaseProvider } from '../../database/database.provider';
import { UpdateProfileInput } from './dto/auth.input';

@Resolver(() => User)
export class AuthResolver {
  constructor(private databaseProvider: DatabaseProvider) {}

  @Query(() => User, { name: 'me', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getMe(@Context() context: { req: { user: { id: string } } }) {
    const userId = context.req.user.id;
    return this.databaseProvider.db.user.findFirst({
      where: {
        id: userId,
      },
    });
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Context() context: { req: { user: { id: string } } },
    @Args('input') input: UpdateProfileInput,
  ) {
    const userId = context.req.user.id;

    // Simple availability check
    if (input.username) {
      const existing = await this.databaseProvider.db.user.findFirst({
        where: { username: input.username, id: { not: userId } },
      });
      if (existing) throw new Error('Username taken');
    }

    return this.databaseProvider.db.user.update({
      where: { id: userId },
      data: {
        ...input,
      },
    });
  }
}
