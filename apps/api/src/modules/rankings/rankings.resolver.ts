import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  ID,
  Int,
} from '@nestjs/graphql';
import { Ranking } from './ranking.model';
import { RankingsService } from './rankings.service';
import { Game } from '../games/game.model';
import { RankingEntry } from './ranking-entry.model';
import { CreateRankingInput, UpdateRankingInput } from './dto/rankings.input';
import { PaginationInput } from '../../common/pagination/pagination.input';
import { PaginatedRankings } from './dto/rankings.output';
import { DataLoaderService } from '../../common/dataloaders/dataloader.service';

@Resolver(() => Ranking)
export class RankingsResolver {
  constructor(
    private rankingsService: RankingsService,
    private dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => PaginatedRankings, { name: 'rankings' })
  async getRankings(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.rankingsService.findAll(pagination || new PaginationInput());
  }

  @Query(() => Ranking, { name: 'ranking', nullable: true })
  async getRanking(
    @Args('gameSlug') gameSlug: string,
    @Args('slug') slug: string,
  ) {
    return this.rankingsService.findByGameAndSlug(gameSlug, slug);
  }

  @ResolveField(() => Game, { name: 'game' })
  async getGame(@Parent() ranking: Ranking) {
    return this.dataLoaderService.gameLoader.load(ranking.gameId);
  }

  @ResolveField(() => [RankingEntry], { name: 'entries' })
  async getEntries(@Parent() ranking: Ranking) {
    return this.rankingsService.getEntries(ranking.id);
  }

  @Mutation(() => Ranking)
  async updateRanking(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateRankingInput,
  ) {
    return this.rankingsService.update(id, input);
  }

  @Mutation(() => Ranking)
  async createRanking(@Args('input') input: CreateRankingInput) {
    return this.rankingsService.create(input);
  }

  @Mutation(() => RankingEntry)
  async addPlayerToRanking(
    @Args('rankingId', { type: () => ID }) rankingId: string,
    @Args('playerId', { type: () => ID }) playerId: string,
    @Args('initialElo', { type: () => Int, nullable: true })
    initialElo?: number,
  ) {
    return this.rankingsService.addPlayer(rankingId, playerId, initialElo);
  }

  @Mutation(() => RankingEntry)
  async registerSelfToRanking(
    @Args('rankingId', { type: () => ID }) rankingId: string,
    @Args('userId', { type: () => ID }) userId: string,
  ) {
    return this.rankingsService.registerSelf(rankingId, userId);
  }
}
