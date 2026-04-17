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
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequiredPermissions } from '../auth/decorators/required-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User as UserModel } from '../auth/user.model';
import { League } from './league.model';
import { LeaguesService } from './leagues.service';
import { DataLoaderService } from '@/common/dataloaders/dataloader.service';
import { PaginatedLeagues } from './dto/leagues.output';
import { PaginationInput } from '@/common/pagination/pagination.input';
import { LeagueEntry } from './league-entry.model';
import { CreateLeagueInput, UpdateLeagueInput } from './dto/leagues.input';
import { Game } from '../games/game.model';

@Resolver(() => League)
export class LeaguesResolver {
  constructor(
    private leaguesService: LeaguesService,
    private dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => PaginatedLeagues, { name: 'leagues' })
  async getLeagues(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.leaguesService.findAll(pagination || new PaginationInput());
  }

  @Query(() => League, { name: 'league', nullable: true })
  async getLeague(
    @Args('gameSlug') gameSlug: string,
    @Args('slug') slug: string,
  ) {
    return this.leaguesService.findByGameAndSlug(gameSlug, slug);
  }

  @ResolveField(() => Game, { name: 'game' })
  async getGame(@Parent() league: League) {
    return this.dataLoaderService.gameLoader.load(league.gameId);
  }

  @ResolveField(() => [LeagueEntry], { name: 'entries' })
  async getEntries(@Parent() league: League) {
    return this.leaguesService.getEntries(league.id);
  }

  @Mutation(() => League)
  @UseGuards(GqlAuthGuard)
  async updateLeague(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLeagueInput,
    @CurrentUser() user: UserModel,
  ) {
    return this.leaguesService.update(
      id,
      input,
      user.isAdmin ? undefined : user.id,
    );
  }

  @Mutation(() => League)
  @UseGuards(GqlAuthGuard)
  async createLeague(
    @Args('input') input: CreateLeagueInput,
    @CurrentUser() user: UserModel,
  ) {
    // Sobrescreve o authorId do input com o ID do usuário autenticado
    return this.leaguesService.create({ ...input, authorId: user.id });
  }

  @Mutation(() => LeagueEntry)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequiredPermissions('manage_events')
  async addPlayerToLeague(
    @Args('leagueId', { type: () => ID }) leagueId: string,
    @Args('playerId', { type: () => ID }) playerId: string,
    @Args('initialElo', { type: () => Int, nullable: true })
    initialElo?: number,
  ) {
    return this.leaguesService.addPlayer(leagueId, playerId, initialElo);
  }

  @Mutation(() => LeagueEntry)
  @UseGuards(GqlAuthGuard)
  async registerSelfToLeague(
    @Args('leagueId', { type: () => ID }) leagueId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.leaguesService.registerSelf(leagueId, user.id);
  }
}
