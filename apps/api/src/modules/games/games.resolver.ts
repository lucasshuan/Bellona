import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  ID,
} from '@nestjs/graphql';
import { Game } from './game.model';
import { GamesService } from './games.service';
import { User } from '../auth/user.model';
import { Ranking } from '../rankings/ranking.model';
import { CreateGameInput, UpdateGameInput } from './dto/games.input';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { PaginatedGames } from './dto/games.output';
import { DataLoaderService } from '../../common/dataloaders/dataloader.service';

@Resolver(() => Game)
export class GamesResolver {
  constructor(
    private gamesService: GamesService,
    private dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => PaginatedGames, { name: 'games' })
  async getGames(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('search', { nullable: true }) search?: string,
  ) {
    return this.gamesService.findAll(
      pagination || new PaginationInput(),
      search,
    );
  }

  @Query(() => Game, { name: 'game', nullable: true })
  async getGameBySlug(@Args('slug') slug: string) {
    return this.gamesService.findBySlug(slug);
  }

  @ResolveField(() => User, { name: 'author', nullable: true })
  async getAuthor(@Parent() game: Game) {
    return this.dataLoaderService.userLoader.load(game.authorId);
  }

  @ResolveField(() => [Ranking], { name: 'rankings' })
  async getRankings(@Parent() game: Game) {
    return this.gamesService.getRankings(game.id);
  }

  @Mutation(() => Game)
  async createGame(@Args('input') input: CreateGameInput) {
    return this.gamesService.create(input);
  }

  @Mutation(() => Game)
  async updateGame(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGameInput,
  ) {
    return this.gamesService.update(id, input);
  }

  @Mutation(() => Game)
  async approveGame(@Args('id', { type: () => ID }) id: string) {
    return this.gamesService.approve(id);
  }
}
