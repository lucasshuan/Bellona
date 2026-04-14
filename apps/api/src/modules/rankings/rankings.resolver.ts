import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Mutation,
  ID,
  InputType,
  Field,
  Int,
  Float,
} from '@nestjs/graphql';
import { Ranking } from './ranking.model';
import { RankingsService } from './rankings.service';
import { DatabaseProvider } from '../../database/database.provider';
import { Game } from '../games/game.model';
import { RankingEntry } from './ranking-entry.model';

@Resolver(() => Ranking)
export class RankingsResolver {
  constructor(
    private rankingsService: RankingsService,
    private databaseProvider: DatabaseProvider,
  ) {}

  @Query(() => [Ranking], { name: 'rankings' })
  async getRankings() {
    return this.rankingsService.findAll();
  }

  @Query(() => Ranking, { name: 'ranking', nullable: true })
  async getRanking(
    @Args('gameSlug') gameSlug: string,
    @Args('slug') slug: string,
  ) {
    const game = await this.databaseProvider.db.game.findFirst({
      where: { slug: gameSlug },
    });
    if (!game) return null;
    return this.rankingsService.findByGameAndSlug(game.id, slug);
  }

  @ResolveField(() => Game, { name: 'game' })
  async getGame(@Parent() ranking: Ranking) {
    return this.databaseProvider.db.game.findUnique({
      where: { id: ranking.gameId },
    });
  }

  @ResolveField(() => [RankingEntry], { name: 'entries' })
  async getEntries(@Parent() ranking: Ranking) {
    return this.databaseProvider.db.rankingEntry.findMany({
      where: { rankingId: ranking.id },
      include: {
        player: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        currentElo: 'desc',
      },
    });
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

@InputType()
export class CreateRankingInput {
  @Field()
  gameId: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  initialElo: number;

  @Field()
  ratingSystem: string;

  @Field()
  allowDraw: boolean;

  @Field(() => Int)
  kFactor: number;

  @Field(() => Float)
  scoreRelevance: number;

  @Field(() => Int)
  inactivityDecay: number;

  @Field(() => Int)
  inactivityThresholdHours: number;

  @Field(() => Int)
  inactivityDecayFloor: number;

  @Field(() => Int)
  pointsPerWin: number;

  @Field(() => Int)
  pointsPerDraw: number;

  @Field(() => Int)
  pointsPerLoss: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  authorId: string;
}

@InputType()
export class UpdateRankingInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int, { nullable: true })
  initialElo?: number;

  @Field({ nullable: true })
  ratingSystem?: string;

  @Field({ nullable: true })
  allowDraw?: boolean;

  @Field(() => Int, { nullable: true })
  kFactor?: number;

  @Field(() => Float, { nullable: true })
  scoreRelevance?: number;

  @Field(() => Int, { nullable: true })
  inactivityDecay?: number;

  @Field(() => Int, { nullable: true })
  inactivityThresholdHours?: number;

  @Field(() => Int, { nullable: true })
  inactivityDecayFloor?: number;

  @Field(() => Int, { nullable: true })
  pointsPerWin?: number;

  @Field(() => Int, { nullable: true })
  pointsPerDraw?: number;

  @Field(() => Int, { nullable: true })
  pointsPerLoss?: number;
}
