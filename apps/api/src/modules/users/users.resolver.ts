import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../auth/user.model';
import { UsersService } from './users.service';
import { Player } from '../games/player.model';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { PaginatedUsers } from './dto/users.output';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User, { name: 'user', nullable: true })
  async getUserByUsername(@Args('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Query(() => PaginatedUsers, { name: 'searchUsers' })
  async searchUsers(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('query', { nullable: true }) query?: string,
  ) {
    return this.usersService.search(pagination || new PaginationInput(), query);
  }

  @ResolveField(() => [Player], { name: 'players' })
  async getPlayers(@Parent() user: User) {
    return this.usersService.getPlayersWithRanks(user.id);
  }
}
