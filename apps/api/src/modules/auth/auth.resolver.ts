import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { User } from './user.model';
import { GqlAuthGuard } from './gql-auth.guard';
import { DatabaseProvider } from '../../database/database.provider';
import { UpdateProfileInput } from './dto/auth.input';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver(() => User)
export class AuthResolver {
  constructor(private databaseProvider: DatabaseProvider) {}

  @Query(() => User, { name: 'me', nullable: true })
  @UseGuards(GqlAuthGuard)
  async getMe(@CurrentUser() user: { id: string }) {
    return this.databaseProvider.db.user.findFirst({
      where: {
        id: user.id,
      },
    });
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateProfileInput,
  ) {
    const userId = user.id;

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
