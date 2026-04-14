import {
  Parent,
  ResolveField,
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
} from '@nestjs/graphql';
import { Player, PlayerUsername } from './player.model';
import { User } from '../auth/user.model';
import { GamesService } from './games.service';
import { AddPlayerToGameInput } from './dto/players.input';
import { DataLoaderService } from '../../common/dataloaders/dataloader.service';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { PaginatedPlayers } from './dto/players.output';

@Resolver(() => Player)
export class PlayersResolver {
  constructor(
    private gamesService: GamesService,
    private dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => Player, { name: 'player', nullable: true })
  async getPlayer(@Args('id', { type: () => ID }) id: string) {
    return this.gamesService.getPlayer(id);
  }

  @ResolveField(() => User, { name: 'user', nullable: true })
  async getUser(@Parent() player: Player) {
    if (!player.userId) return null;
    return this.dataLoaderService.userLoader.load(player.userId);
  }

  @ResolveField(() => [PlayerUsername], { name: 'usernames' })
  async getUsernames(@Parent() player: Player) {
    return this.gamesService.getPlayerUsernames(player.id);
  }

  @Mutation(() => Player)
  async addPlayerToGame(@Args('input') input: AddPlayerToGameInput) {
    return this.gamesService.addPlayerToGame(input);
  }

  @Query(() => PaginatedPlayers, { name: 'searchPlayers' })
  async searchPlayers(
    @Args('gameId', { type: () => ID }) gameId: string,
    @Args('query') query: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.gamesService.searchPlayers(
      gameId,
      query,
      pagination || new PaginationInput(),
    );
  }
}
