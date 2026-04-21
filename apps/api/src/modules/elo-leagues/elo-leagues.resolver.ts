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
import { EloLeague } from './elo-league.model';
import { EloLeaguesService } from './elo-leagues.service';
import { DataLoaderService } from '@/common/dataloaders/dataloader.service';
import { PaginatedEloLeagues } from './dto/elo-leagues.output';
import { PaginationInput } from '@/common/pagination/pagination.input';
import { EloLeagueEntry } from './elo-league-entry.model';
import {
  CreateEloLeagueInput,
  UpdateEloLeagueInput,
} from './dto/elo-leagues.input';
import { CreateEventInput, UpdateEventInput } from '../events/dto/event.input';

@Resolver(() => EloLeague)
export class EloLeaguesResolver {
  constructor(
    private eloLeaguesService: EloLeaguesService,
    private dataLoaderService: DataLoaderService,
  ) {}

  @Query(() => PaginatedEloLeagues, { name: 'eloLeagues' })
  async getEloLeagues(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.eloLeaguesService.findAll(pagination || new PaginationInput());
  }

  @Query(() => EloLeague, { name: 'eloLeague', nullable: true })
  async getEloLeague(
    @Args('gameSlug') gameSlug: string,
    @Args('slug') slug: string,
  ) {
    return this.eloLeaguesService.findByGameAndSlug(gameSlug, slug);
  }

  @ResolveField(() => ID, { name: 'id' })
  getId(@Parent() league: EloLeague & { eventId?: string }) {
    return league.id ?? league.eventId;
  }

  @ResolveField(() => [EloLeagueEntry], { name: 'entries' })
  async getEntries(@Parent() league: EloLeague & { eventId?: string }) {
    return this.dataLoaderService.eloLeagueEntriesLoader.load(
      league.id ?? league.eventId!,
    );
  }

  @Mutation(() => EloLeague)
  @UseGuards(GqlAuthGuard)
  async updateEloLeague(
    @Args('id', { type: () => ID }) id: string,
    @Args('event', { nullable: true, type: () => UpdateEventInput })
    event?: UpdateEventInput,
    @Args('league', { nullable: true, type: () => UpdateEloLeagueInput })
    league?: UpdateEloLeagueInput,
    @CurrentUser() user?: UserModel,
  ) {
    return this.eloLeaguesService.update(
      id,
      event,
      league,
      user?.isAdmin ? undefined : user?.id,
    );
  }

  @Mutation(() => EloLeague)
  @UseGuards(GqlAuthGuard)
  async createEloLeague(
    @Args('event') event: CreateEventInput,
    @Args('league') league: CreateEloLeagueInput,
    @CurrentUser() user: UserModel,
  ) {
    return this.eloLeaguesService.create(event, league, user.id);
  }

  @Mutation(() => EloLeagueEntry)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequiredPermissions('manage_events')
  async addPlayerToEloLeague(
    @Args('leagueId', { type: () => ID }) leagueId: string,
    @Args('playerId', { type: () => ID }) playerId: string,
    @Args('initialElo', { type: () => Int, nullable: true })
    initialElo?: number,
  ) {
    return this.eloLeaguesService.addPlayer(leagueId, playerId, initialElo);
  }

  @Mutation(() => EloLeagueEntry)
  @UseGuards(GqlAuthGuard)
  async registerSelfToEloLeague(
    @Args('leagueId', { type: () => ID }) leagueId: string,
    @CurrentUser() user: UserModel,
  ) {
    return this.eloLeaguesService.registerSelf(leagueId, user.id);
  }
}
