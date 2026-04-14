import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../auth/user.model';
import { UsersService } from './users.service';
import { Player } from '../games/player.model';
import { DatabaseProvider } from '../../database/database.provider';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private databaseProvider: DatabaseProvider,
  ) {}

  @Query(() => User, { name: 'user', nullable: true })
  async getUserByUsername(@Args('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  @Query(() => [User], { name: 'searchUsers' })
  async searchUsers(@Args('query') query: string) {
    return this.usersService.search(query);
  }

  @ResolveField(() => [Player], { name: 'players' })
  async getPlayers(@Parent() user: User) {
    const players = await this.databaseProvider.db.player.findMany({
      where: { userId: user.id },
      include: {
        game: true,
        rankingEntries: {
          include: {
            ranking: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    const playerIds = players.map((p) => p.id);
    if (playerIds.length === 0) return players;

    // Rank calculation logic
    const userRanks = await this.databaseProvider.db.$queryRaw<
      { player_id: string; event_id: string; position: bigint }[]
    >`
      SELECT player_id, event_id, position FROM (
        SELECT 
          player_id, 
          event_id, 
          RANK() OVER (PARTITION BY event_id ORDER BY current_elo DESC) as position
        FROM ranking_entries
      ) ranked_entries
      WHERE player_id IN (${playerIds.join(',')})
    `;

    return players.map((player) => {
      const rankingsWithPos = player.rankingEntries.map((entry) => {
        const rankInfo = userRanks.find(
          (r) => r.player_id === player.id && r.event_id === entry.rankingId,
        );
        return {
          ...entry,
          position: rankInfo ? Number(rankInfo.position) : 0,
        };
      });
      return {
        ...player,
        rankingEntries: rankingsWithPos,
      };
    });
  }
}
